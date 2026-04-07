from datetime import date

from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.views import APIView

from api.permissions import IsAdminUserRole
from models import Alert, Appointment, Assessment, ChatLog, InsuranceRequest, Medication, Report, SymptomLog, SystemConfiguration
from serializers.admin import AlertSerializer, AssessmentAdminSerializer, ChatLogSerializer, InsuranceAdminSerializer, MedicationAdminSerializer, ReportAdminSerializer, SymptomAdminSerializer, SystemConfigurationSerializer
from serializers.auth import UserSerializer
from serializers.healthcare import AppointmentAdminSerializer
from services.email_service import send_appointment_email

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        appointments = Appointment.objects.select_related("user").order_by("-created_at")[:5]
        return Response({
            "total_users": User.objects.filter(role="user").count(),
            "appointments_today": Appointment.objects.filter(appointment_date=date.today()).count(),
            "active_medications": Medication.objects.count(),
            "alerts_count": Alert.objects.filter(status="open").count(),
            "assessments_count": Assessment.objects.count(),
            "reports_count": Report.objects.count(),
            "insurance_count": InsuranceRequest.objects.count(),
            "chat_logs_count": ChatLog.objects.count(),
            "symptom_frequency": list(SymptomLog.objects.values("predicted_disease").annotate(total=Count("id")).order_by("-total")[:6]),
            "patient_statistics": list(User.objects.values("gender").annotate(total=Count("id")).order_by("-total")),
            "appointments": AppointmentAdminSerializer(appointments, many=True).data,
        })


class AdminUserListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        users = User.objects.filter(role="user").order_by("-date_joined")
        payload = []
        for user in users:
            latest_symptom = user.symptoms.order_by("-created_at").first()
            payload.append({**UserSerializer(user).data, "latest_symptom": latest_symptom.symptom_text if latest_symptom else "", "status": "Blocked" if user.is_blocked else "Active", "assessment": getattr(user, "assessment", None).summary if hasattr(user, "assessment") else ""})
        return Response(payload)

    def patch(self, request):
        user = User.objects.get(id=request.data.get("user_id"), role="user")
        user.is_blocked = bool(request.data.get("is_blocked"))
        user.save(update_fields=["is_blocked"])
        return Response(UserSerializer(user).data)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request, user_id):
        user = User.objects.get(id=user_id, role="user")
        return Response({
            "profile": UserSerializer(user).data,
            "assessment": getattr(user, "assessment", None).summary if hasattr(user, "assessment") else "",
            "assessment_payload": AssessmentAdminSerializer(getattr(user, "assessment", None)).data if hasattr(user, "assessment") else None,
            "disease_history": getattr(user, "assessment", None).disease_history if hasattr(user, "assessment") else "",
            "documents_text": getattr(user, "assessment", None).extracted_document_text if hasattr(user, "assessment") else "",
            "symptoms": SymptomAdminSerializer(user.symptoms.order_by("-created_at"), many=True).data,
            "appointments": AppointmentAdminSerializer(user.appointments.order_by("-created_at"), many=True).data,
            "medications": MedicationAdminSerializer(user.medications.order_by("-created_at"), many=True).data,
            "reports": ReportAdminSerializer(user.reports.order_by("-created_at"), many=True).data,
            "insurance_requests": InsuranceAdminSerializer(user.insurance_requests.order_by("-created_at"), many=True).data,
            "chat_logs": ChatLogSerializer(user.chat_logs.order_by("-created_at")[:20], many=True).data,
        })


class AdminAssessmentsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        items = Assessment.objects.select_related("user").order_by("-updated_at")
        return Response(AssessmentAdminSerializer(items, many=True).data)


class AdminAppointmentListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        appointments = Appointment.objects.select_related("user").order_by("-appointment_date", "-appointment_time")
        return Response(AppointmentAdminSerializer(appointments, many=True).data)

    def patch(self, request):
        appointment = Appointment.objects.select_related("user").get(id=request.data.get("appointment_id"))
        appointment.status = request.data.get("status", appointment.status)
        appointment.save(update_fields=["status"])
        send_appointment_email(appointment.user.email, appointment)
        return Response(AppointmentAdminSerializer(appointment).data)


class AdminSymptomsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        items = SymptomLog.objects.select_related("user").order_by("-created_at")
        return Response(SymptomAdminSerializer(items, many=True).data)


class AdminMedicationsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        items = Medication.objects.select_related("user").order_by("-created_at")
        return Response(MedicationAdminSerializer(items, many=True).data)


class AdminReportsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        items = Report.objects.select_related("user").order_by("-created_at")
        return Response(ReportAdminSerializer(items, many=True).data)


class AdminInsuranceView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        items = InsuranceRequest.objects.select_related("user").order_by("-created_at")
        return Response(InsuranceAdminSerializer(items, many=True).data)


class AdminLogsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        logs = ChatLog.objects.select_related("user").order_by("-created_at")[:100]
        return Response(ChatLogSerializer(logs, many=True).data)


class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        return Response({
            "symptom_trends": list(SymptomLog.objects.values("predicted_disease").annotate(total=Count("id")).order_by("-total")),
            "appointment_trends": list(Appointment.objects.values("status").annotate(total=Count("id")).order_by("-total")),
            "user_growth": list(User.objects.values("date_joined__date").annotate(total=Count("id")).order_by("date_joined__date")),
            "insurance_requests": InsuranceAdminSerializer(InsuranceRequest.objects.select_related("user"), many=True).data,
            "assessment_overview": AssessmentAdminSerializer(Assessment.objects.select_related("user")[:10], many=True).data,
        })


class AdminAlertsView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        alerts = Alert.objects.select_related("user").order_by("-created_at")
        return Response(AlertSerializer(alerts, many=True).data)


class AdminSystemControlView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        config, _ = SystemConfiguration.objects.get_or_create(id=1)
        return Response(SystemConfigurationSerializer(config).data)

    def patch(self, request):
        config, _ = SystemConfiguration.objects.get_or_create(id=1)
        serializer = SystemConfigurationSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
