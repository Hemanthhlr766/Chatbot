from models import Alert, Appointment, Assessment, ChatLog, InsuranceRequest, Medication, Report, SymptomLog
from django.http import HttpResponse
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from serializers.auth import UserSerializer
from serializers.healthcare import AppointmentSerializer, AssessmentSerializer, InsuranceRequestSerializer, MedicationSerializer, ReportSerializer, SymptomLogSerializer
from services.ai_service import analyze_report_document, build_assessment_questions, detect_action_from_chat, generate_chatbot_response, predict_symptom_outcome, recommend_hospitals_from_location, summarize_report_findings
from services.email_service import send_admin_notification, send_appointment_email, send_medication_reminder
from services.emergency_service import detect_emergency
from services.pdf_service import extract_pdf_text
from services.voice_service import speech_to_text, text_to_speech_bytes


ADMIN_RESTRICTED_ACTIONS = {"check_symptoms", "diet_plan", "report_help", "book_appointment", "medication_help", "insurance_help"}


class ProfileView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class AssessmentView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Medical assessments are restricted to user accounts only."}, status=status.HTTP_403_FORBIDDEN)
        assessment, _ = Assessment.objects.get_or_create(user=request.user)
        return Response(AssessmentSerializer(assessment).data)

    def post(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Medical assessments are restricted to user accounts only."}, status=status.HTTP_403_FORBIDDEN)
        assessment, _ = Assessment.objects.get_or_create(user=request.user)
        extracted_text = assessment.extracted_document_text
        upload = request.FILES.get("document")
        if upload:
            extracted_text = extract_pdf_text(upload)

        raw_flag = request.data.get("is_previously_treated", False)
        is_previously_treated = str(raw_flag).lower() in {"true", "1", "yes"}
        disease_history = request.data.get("disease_history", "")
        questions, summary = build_assessment_questions(disease_history=disease_history, extracted_text=extracted_text, is_previously_treated=is_previously_treated)

        assessment.is_previously_treated = is_previously_treated
        assessment.disease_history = disease_history
        assessment.extracted_document_text = extracted_text
        assessment.generated_questions = questions
        assessment.answers = request.data.get("answers", {}) or {}
        assessment.summary = summary
        assessment.save()

        request.user.first_login_completed = True
        request.user.save(update_fields=["first_login_completed"])
        return Response(AssessmentSerializer(assessment).data)


class SymptomCheckerView(APIView):
    def get(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Symptom submissions are restricted to user accounts. Admins should use monitoring pages."}, status=status.HTTP_403_FORBIDDEN)
        logs = SymptomLog.objects.filter(user=request.user).order_by("-created_at")
        return Response(SymptomLogSerializer(logs, many=True).data)

    def post(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Symptom submissions are restricted to user accounts. Admins should use monitoring pages."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SymptomLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        symptom_text = serializer.validated_data["symptom_text"]
        source = serializer.validated_data.get("source", "text")
        prediction = predict_symptom_outcome(symptom_text, request.user)

        log = SymptomLog.objects.create(user=request.user, symptom_text=symptom_text, source=source, predicted_disease=prediction["predicted_disease"], suggestions=prediction["suggestions"], confidence_score=prediction["confidence_score"])

        emergency_message = detect_emergency(symptom_text)
        if emergency_message:
            Alert.objects.create(user=request.user, message=emergency_message)
            send_admin_notification(subject="Critical health alert", message=f"{request.user.name}: {emergency_message}")

        return Response(SymptomLogSerializer(log).data, status=status.HTTP_201_CREATED)


class NearbyHospitalsView(APIView):
    def get(self, request):
        try:
            hospitals = recommend_hospitals_from_location(request.user.location)
        except Exception as error:
            return Response({"detail": f"Unable to fetch nearby hospitals: {error}"}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({"location": request.user.location, "hospitals": hospitals})


class AppointmentListCreateView(APIView):
    def get(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Admins should use appointment management pages instead of patient booking pages."}, status=status.HTTP_403_FORBIDDEN)
        appointments = Appointment.objects.filter(user=request.user).order_by("-appointment_date", "-appointment_time")
        return Response(AppointmentSerializer(appointments, many=True).data)

    def post(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Admins cannot create patient appointments for themselves from the patient workflow."}, status=status.HTTP_403_FORBIDDEN)
        serializer = AppointmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save(user=request.user)
        send_admin_notification(subject="New appointment request", message=f"{request.user.name} requested an appointment at {appointment.hospital_name}.")
        return Response(AppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)


class AppointmentStatusUpdateView(APIView):
    def patch(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(id=appointment_id, user=request.user)
        except Appointment.DoesNotExist:
            return Response({"detail": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        status_value = request.data.get("status")
        if status_value not in {"cancelled", "rescheduled"}:
            return Response({"detail": "Unsupported status update."}, status=status.HTTP_400_BAD_REQUEST)

        appointment.status = status_value
        if "appointment_date" in request.data:
            appointment.appointment_date = request.data["appointment_date"]
        if "appointment_time" in request.data:
            appointment.appointment_time = request.data["appointment_time"]
        appointment.save()
        send_appointment_email(appointment.user.email, appointment)
        return Response(AppointmentSerializer(appointment).data)


class MedicationListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Medication entry is restricted to user accounts. Admins should use monitoring pages."}, status=status.HTTP_403_FORBIDDEN)
        medications = Medication.objects.filter(user=request.user).order_by("-created_at")
        return Response(MedicationSerializer(medications, many=True).data)

    def post(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Medication entry is restricted to user accounts. Admins should use monitoring pages."}, status=status.HTTP_403_FORBIDDEN)
        extracted_text = ""
        upload = request.FILES.get("document")
        if upload:
            extracted_text = extract_pdf_text(upload)

        serializer = MedicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        medication = serializer.save(user=request.user, extracted_source_text=extracted_text)
        send_medication_reminder(medication)
        return Response(MedicationSerializer(medication).data, status=status.HTTP_201_CREATED)


class ReportListCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Report uploads are restricted to user accounts. Admins should use monitoring pages."}, status=status.HTTP_403_FORBIDDEN)
        reports = Report.objects.filter(user=request.user).order_by("-created_at")
        return Response(ReportSerializer(reports, many=True).data)

    def post(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Report uploads are restricted to user accounts. Admins should use monitoring pages."}, status=status.HTTP_403_FORBIDDEN)
        extracted_text = ""
        upload = request.FILES.get("file")
        if upload:
            extracted_text = extract_pdf_text(upload)

        payload = request.data.copy()
        if not payload.get("title"):
            payload["title"] = upload.name.rsplit(".", 1)[0] if upload else "Uploaded report"
        serializer = ReportSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        analysis = analyze_report_document(extracted_text or request.data.get("notes", ""), payload.get("report_type", "medical"))
        report = serializer.save(user=request.user, extracted_text=extracted_text, findings=analysis)
        return Response(ReportSerializer(report).data, status=status.HTTP_201_CREATED)


class InsuranceRequestCreateView(APIView):
    def get(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Insurance submissions are restricted to user accounts. Admins should use monitoring pages."}, status=status.HTTP_403_FORBIDDEN)
        items = InsuranceRequest.objects.filter(user=request.user).order_by("-created_at")
        return Response(InsuranceRequestSerializer(items, many=True).data)

    def post(self, request):
        if request.user.role == "admin":
            return Response({"detail": "Insurance submissions are restricted to user accounts. Admins should use monitoring pages."}, status=status.HTTP_403_FORBIDDEN)
        serializer = InsuranceRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = serializer.save(user=request.user)
        send_admin_notification(subject="Insurance request submitted", message=f"Policy {item.policy_number} from {request.user.name} requires review.")
        return Response(InsuranceRequestSerializer(item).data, status=status.HTTP_201_CREATED)


class VoiceTranscriptionView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        audio_file = request.FILES.get("audio")
        if not audio_file:
            return Response({"detail": "Audio file is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            transcript = speech_to_text(audio_file)
        except Exception as error:
            return Response({"detail": f"Voice transcription failed: {error}"}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({"transcript": transcript})


class VoiceSynthesisView(APIView):
    parser_classes = [JSONParser]

    def post(self, request):
        text = request.data.get("text", "").strip()
        if not text:
            return Response({"detail": "Text is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            audio_bytes = text_to_speech_bytes(text)
        except Exception as error:
            return Response({"detail": f"Voice synthesis failed: {error}"}, status=status.HTTP_502_BAD_GATEWAY)

        if not audio_bytes:
            return Response({"detail": "Voice synthesis is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        response = HttpResponse(audio_bytes, content_type="audio/mpeg")
        response["Content-Disposition"] = 'inline; filename="assistant-response.mp3"'
        return response


class ChatbotView(APIView):
    def post(self, request):
        message = request.data.get("message", "").strip()
        if not message:
            return Response({"detail": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)

        action = detect_action_from_chat(message)

        if request.user.role == "admin":
            if action in ADMIN_RESTRICTED_ACTIONS:
                response_text = (
                    "Medical assessments and patient-style diagnosis workflows are restricted to user accounts only. "
                    "As an administrator, you can review user outputs, system analytics, reports, medications, appointments, and alerts instead."
                )
                route = "/admin/analytics"
            else:
                response_text = (
                    "As an administrator, I can help you monitor users, inspect appointments, review reports, analyze symptom trends, and check emergency alerts. "
                    "Try asking for user summaries, alert reviews, appointment status, or system activity."
                )
                route = "/admin"

            ChatLog.objects.create(user=request.user, user_message=message, bot_response=response_text, action_triggered="admin_supervision")
            return Response({"message": response_text, "action": "admin_supervision", "route": route})

        context = {
            "assessment": getattr(request.user, "assessment", None).summary if hasattr(request.user, "assessment") else "",
            "recent_symptoms": list(request.user.symptoms.order_by("-created_at")[:3].values("symptom_text", "predicted_disease")),
            "medications": list(request.user.medications.order_by("-created_at")[:3].values("medicine_name", "schedule")),
            "reports": list(request.user.reports.order_by("-created_at")[:3].values("title", "report_type", "findings")),
            "appointments": list(request.user.appointments.order_by("-created_at")[:3].values("hospital_name", "appointment_date", "status")),
        }
        response_text, route = generate_chatbot_response(message, request.user, context, action)

        emergency_message = detect_emergency(message)
        if emergency_message:
            Alert.objects.create(user=request.user, message=emergency_message)
            send_admin_notification(subject="Critical chatbot alert", message=f"{request.user.name}: {emergency_message}")
            action = "critical_alert"
            route = None

        ChatLog.objects.create(user=request.user, user_message=message, bot_response=response_text, action_triggered=action or "")
        return Response({"message": response_text, "action": action, "route": route})



