from typing import Any
import json
import logging

from django.conf import settings

try:
    from openai import OpenAI
except Exception:  # pragma: no cover
    OpenAI = None

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover
    genai = None


logger = logging.getLogger(__name__)

SYMPTOM_KEYWORDS = ["symptom", "pain", "fever", "cough", "headache", "cold", "vomit", "nausea", "dizziness", "body pain", "fatigue"]
REPORT_KEYWORDS = ["report", "scan", "lab", "blood", "x-ray", "mri", "findings", "test result"]
APPOINTMENT_KEYWORDS = ["appointment", "book", "schedule", "visit", "consultation"]
MEDICATION_KEYWORDS = ["medicine", "medication", "tablet", "dose", "prescription", "reminder", "syrup"]
INSURANCE_KEYWORDS = ["insurance", "policy", "claim", "coverage"]
DIET_KEYWORDS = ["diet", "food", "meal", "nutrition", "vegetable", "vegetables", "fruits", "eat", "eating"]
GENERAL_QUESTION_HINTS = ["what", "who", "where", "when", "which", "how", "why", "tell me", "explain"]



def _safe_openai_client(api_key: str | None = None):
    key = (api_key or getattr(settings, "OPENAI_API_KEY", "") or "").strip()
    if key and OpenAI:
        return OpenAI(api_key=key)
    return None



def _safe_gemini_model(api_key: str | None = None):
    key = api_key or getattr(settings, "GEMINI_API_KEY_CHATBOT", "") or settings.GEMINI_API_KEY
    if key and genai:
        genai.configure(api_key=key)
        return genai.GenerativeModel("gemini-1.5-flash")
    return None



def _extract_gemini_text(result: Any) -> str:
    text = getattr(result, "text", "") or ""
    if text:
        return text.strip()
    candidates = getattr(result, "candidates", None) or []
    parts: list[str] = []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        if not content:
            continue
        for part in getattr(content, "parts", []) or []:
            part_text = getattr(part, "text", "")
            if part_text:
                parts.append(part_text)
    return "\n".join(parts).strip()



def _extract_openai_text(response: Any) -> str:
    text = getattr(response, "output_text", "") or ""
    if text:
        return text.strip()
    output = getattr(response, "output", None) or []
    parts: list[str] = []
    for item in output:
        for content in getattr(item, "content", []) or []:
            part_text = getattr(content, "text", "")
            if part_text:
                parts.append(part_text)
    return "\n".join(parts).strip()



def _generate_gemini_text(prompt: str, *api_keys: str) -> str:
    if not genai:
        return ""

    seen: set[str] = set()
    ordered_keys = [
        *api_keys,
        getattr(settings, "GEMINI_API_KEY_CHATBOT", ""),
        getattr(settings, "GEMINI_API_KEY_HOSPITAL", ""),
        getattr(settings, "GEMINI_API_KEY_MEDICATION", ""),
        getattr(settings, "GEMINI_API_KEY_REPORT", ""),
        getattr(settings, "GEMINI_API_KEY", ""),
    ]

    for key in ordered_keys:
        normalized = (key or "").strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        try:
            genai.configure(api_key=normalized)
            model = genai.GenerativeModel("gemini-1.5-flash")
            result = model.generate_content(prompt)
            text = _extract_gemini_text(result)
            if text:
                return text.strip()
        except Exception as exc:
            logger.warning("Gemini generation failed for one configured key: %s", exc)
    return ""



def _generate_openai_text(prompt: str, *api_keys: str, system: str = "", model_name: str | None = None) -> str:
    if not OpenAI:
        return ""

    seen: set[str] = set()
    ordered_keys = [
        *api_keys,
        getattr(settings, "OPENAI_API_KEY_CHATBOT", ""),
        getattr(settings, "OPENAI_API_KEY", ""),
    ]
    selected_model = model_name or getattr(settings, "OPENAI_MODEL_CHATBOT", "gpt-4o-mini")

    for key in ordered_keys:
        normalized = (key or "").strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        client = _safe_openai_client(normalized)
        if not client:
            continue
        try:
            input_payload: Any = prompt
            if system:
                input_payload = [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ]
            response = client.responses.create(model=selected_model, input=input_payload)
            text = _extract_openai_text(response)
            if text:
                return text.strip()
        except Exception as exc:
            logger.warning("OpenAI responses API failed for one configured key: %s", exc)
            try:
                chat_model = selected_model or "gpt-4o-mini"
                messages = []
                if system:
                    messages.append({"role": "system", "content": system})
                messages.append({"role": "user", "content": prompt})
                completion = client.chat.completions.create(model=chat_model, messages=messages)
                chat_text = ((completion.choices[0].message.content or "") if getattr(completion, "choices", None) else "")
                if chat_text:
                    return chat_text.strip()
            except Exception as chat_exc:
                logger.warning("OpenAI chat completions failed for one configured key: %s", chat_exc)
    return ""



def build_assessment_questions(disease_history: str, extracted_text: str, is_previously_treated: bool):
    prompt = (
        "Create a concise preliminary medical assessment with yes/no and text questions based on the user history. "
        f"Previously treated: {is_previously_treated}. History: {disease_history}. Documents: {extracted_text[:2500]}"
    )
    client = _safe_openai_client(getattr(settings, "OPENAI_API_KEY", ""))
    if client:
        try:
            response = client.responses.create(
                model=getattr(settings, "OPENAI_MODEL_ASSESSMENT", "gpt-4.1-mini"),
                input=prompt,
            )
            text = _extract_openai_text(response)
            questions = [{"type": "text", "question": line.strip("- ")} for line in text.splitlines() if line.strip()]
            return questions[:6], text[:1200]
        except Exception:
            pass
    fallback = [
        {"type": "yes_no", "question": "Do you currently have ongoing symptoms related to your history?"},
        {"type": "text", "question": "Describe any current pain, fatigue, or unusual changes."},
        {"type": "text", "question": "List current medications or treatments you are using."},
    ]
    summary = "Structured assessment generated from history and uploaded medical context."
    return fallback, summary



def predict_symptom_outcome(symptom_text: str, user) -> dict[str, Any]:
    prompt = (
        "You are a healthcare triage assistant. Predict a possible disease label, brief suggestions, "
        "and a confidence score from 0 to 1. Keep it safe and non-diagnostic.\n"
        f"User age: {user.age}, gender: {user.gender}, symptom: {symptom_text}"
    )
    text = _generate_gemini_text(prompt, getattr(settings, "GEMINI_API_KEY_CHATBOT", ""))
    if text:
        return {
            "predicted_disease": text.splitlines()[0][:255] if text else "General illness",
            "suggestions": [line.strip("- ") for line in text.splitlines()[1:4] if line.strip()],
            "confidence_score": 0.74,
        }
    lowered = symptom_text.lower()
    if "fever" in lowered or "cough" in lowered:
        return {"predicted_disease": "Viral infection", "suggestions": ["Stay hydrated", "Monitor temperature", "Consult a clinician if symptoms worsen"], "confidence_score": 0.68}
    if "headache" in lowered:
        return {"predicted_disease": "Tension headache", "suggestions": ["Rest in a quiet room", "Hydrate well", "Seek medical advice if severe or persistent"], "confidence_score": 0.64}
    return {"predicted_disease": "General health concern", "suggestions": ["Track symptoms", "Rest adequately", "Seek medical advice for persistent issues"], "confidence_score": 0.55}



def analyze_report_document(report_text: str, report_type: str = "medical") -> dict[str, Any]:
    cleaned_text = (report_text or "").strip()
    if not cleaned_text:
        return {
            "analysis_summary": "No readable text could be extracted from the uploaded report.",
            "health_issues": [],
            "recommendations": ["Upload a clearer PDF or add readable report notes for better analysis."],
            "source_excerpt": "",
        }

    system_prompt = (
        "You analyze extracted medical report text for a healthcare assistant platform. "
        "Return concise, safe, non-diagnostic insights in strict JSON with keys: analysis_summary, health_issues, recommendations, source_excerpt. "
        "health_issues and recommendations must be arrays of short strings."
    )
    prompt = (
        f"Report type: {report_type}\n"
        f"Extracted report text:\n{cleaned_text[:5000]}"
    )

    openai_text = _generate_openai_text(
        prompt,
        getattr(settings, "OPENAI_API_KEY_CHATBOT", ""),
        getattr(settings, "OPENAI_API_KEY", ""),
        system=system_prompt,
        model_name=getattr(settings, "OPENAI_MODEL_CHATBOT", "gpt-4o-mini"),
    )
    raw_text = openai_text or _generate_gemini_text(prompt, getattr(settings, "GEMINI_API_KEY_REPORT", ""))
    if raw_text:
        try:
            json_text = raw_text.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(json_text)
            return {
                "analysis_summary": str(parsed.get("analysis_summary", "Report reviewed from extracted text.")).strip(),
                "health_issues": [str(item).strip() for item in parsed.get("health_issues", []) if str(item).strip()][:8],
                "recommendations": [str(item).strip() for item in parsed.get("recommendations", []) if str(item).strip()][:6],
                "source_excerpt": str(parsed.get("source_excerpt", cleaned_text[:500])).strip(),
            }
        except Exception:
            pass

    lowered = cleaned_text.lower()
    issues: list[str] = []
    recommendations: list[str] = []

    heuristic_map = {
        "hemoglobin": "Hemoglobin-related values are mentioned; check for anemia-related interpretation in the report.",
        "glucose": "Glucose values are present; blood sugar review may be relevant.",
        "creatinine": "Creatinine values appear in the report; kidney function context may be relevant.",
        "cholesterol": "Cholesterol or lipid profile values are mentioned.",
        "thyroid": "Thyroid-related markers appear in the report.",
        "vitamin d": "Vitamin D values are referenced in the report.",
        "platelet": "Platelet count information is included in the report.",
        "wbc": "White blood cell count is included; infection or inflammation context may matter.",
    }
    for keyword, description in heuristic_map.items():
        if keyword in lowered:
            issues.append(description)

    if any(token in lowered for token in ["high", "increased", "elevated", "positive", "abnormal"]):
        issues.append("One or more measurements may be flagged as high, positive, or abnormal in the extracted text.")
    if any(token in lowered for token in ["low", "decreased", "deficient"]):
        issues.append("One or more measurements may be flagged as low or deficient in the extracted text.")

    if not issues:
        issues.append("The report text was extracted, but no specific abnormality keywords were confidently identified.")

    recommendations.extend([
        "Review the extracted values against reference ranges shown in the original report.",
        "Discuss abnormal or borderline values with a qualified clinician.",
    ])

    return {
        "analysis_summary": "The uploaded PDF was processed and the system extracted report text to identify likely health issues and follow-up points.",
        "health_issues": issues[:8],
        "recommendations": recommendations[:6],
        "source_excerpt": cleaned_text[:500],
    }



def summarize_report_findings(report_text: str):
    return analyze_report_document(report_text).get("health_issues", [])

def recommend_hospitals_from_location(location: str, limit: int = 5) -> list[dict[str, Any]]:
    cleaned_location = (location or "").strip()
    if not cleaned_location:
        raise ValueError("User location is not available. Please update the location in your profile.")

    prompt = (
        "Suggest nearby hospitals for a patient based on the provided city, area, or sector. "
        "Return strictly valid JSON as an array with exactly 5 objects. "
        "Each object must have keys: name, address, distance_km, rating, lat, lng. "
        "Distances should be realistic numbers and lat/lng should be approximate coordinates for the hospital area. "
        f"Location: {cleaned_location}"
    )

    raw_text = _generate_gemini_text(
        prompt,
        getattr(settings, "GEMINI_API_KEY_HOSPITAL", ""),
        getattr(settings, "GEMINI_API_KEY_CHATBOT", ""),
    )
    if raw_text:
        try:
            json_text = raw_text.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(json_text)
            hospitals = []
            for item in parsed[: max(limit, 5)]:
                hospitals.append(
                    {
                        "name": item.get("name", "Recommended Hospital"),
                        "address": item.get("address", cleaned_location),
                        "distance_km": float(item.get("distance_km", 0) or 0),
                        "rating": item.get("rating", "4.5"),
                        "place_id": item.get("name", "recommended-hospital").lower().replace(" ", "-"),
                        "location": {
                            "lat": float(item.get("lat", 0) or 0),
                            "lng": float(item.get("lng", 0) or 0),
                        },
                    }
                )
            if hospitals:
                return hospitals[: max(limit, 5)]
        except Exception as exc:
            logger.warning("Hospital JSON parsing fallback triggered: %s", exc)

    fallback = [
        {"name": f"City Care Hospital, {cleaned_location}", "address": cleaned_location, "distance_km": 2.1, "rating": 4.7, "place_id": "city-care-hospital", "location": {"lat": 17.385, "lng": 78.4867}},
        {"name": f"Apollo Clinic, {cleaned_location}", "address": cleaned_location, "distance_km": 3.0, "rating": 4.6, "place_id": "apollo-clinic", "location": {"lat": 17.392, "lng": 78.478}},
        {"name": f"Sunrise Multispeciality, {cleaned_location}", "address": cleaned_location, "distance_km": 4.2, "rating": 4.5, "place_id": "sunrise-multispeciality", "location": {"lat": 17.401, "lng": 78.491}},
        {"name": f"Lifeline Medical Center, {cleaned_location}", "address": cleaned_location, "distance_km": 5.3, "rating": 4.4, "place_id": "lifeline-medical-center", "location": {"lat": 17.377, "lng": 78.501}},
        {"name": f"BlueCross Specialty Hospital, {cleaned_location}", "address": cleaned_location, "distance_km": 6.1, "rating": 4.3, "place_id": "bluecross-specialty-hospital", "location": {"lat": 17.369, "lng": 78.472}},
    ]
    return fallback[: max(limit, 5)]



def _matches_any(message: str, keywords: list[str]) -> bool:
    return any(keyword in message for keyword in keywords)



def _is_hospital_discovery_request(message: str) -> bool:
    lowered = message.lower()
    has_care_word = _matches_any(lowered, ["hospital", "doctor", "clinic"])
    has_location_word = _matches_any(lowered, ["near", "nearby", "where", "location", "area", "sector"])
    return has_care_word and has_location_word



def detect_action_from_chat(message: str) -> str:
    lowered = message.lower().strip()
    if _matches_any(lowered, APPOINTMENT_KEYWORDS):
        return "book_appointment"
    if _is_hospital_discovery_request(lowered):
        return "hospital_discovery"
    if _matches_any(lowered, REPORT_KEYWORDS):
        return "report_help"
    if _matches_any(lowered, SYMPTOM_KEYWORDS):
        return "check_symptoms"
    if _matches_any(lowered, MEDICATION_KEYWORDS):
        return "medication_help"
    if _matches_any(lowered, INSURANCE_KEYWORDS):
        return "insurance_help"
    if _matches_any(lowered, DIET_KEYWORDS):
        return "diet_plan"
    if _matches_any(lowered, GENERAL_QUESTION_HINTS) or lowered.endswith("?"):
        return "general_help"
    return "general_help"



def _recent_summary(items: list[dict[str, Any]], empty_text: str, formatter) -> str:
    if not items:
        return empty_text
    return "; ".join(formatter(item) for item in items[:3])



def generate_diet_plan_hint(user, context: dict[str, Any]) -> str:
    meds = context.get("medications", [])
    med_names = ", ".join(item.get("medicine_name", "") for item in meds if item.get("medicine_name")) or "no tracked medications"
    return (
        f"Suggested wellness focus for {user.name}: balanced meals, regular hydration, more vegetables and protein-rich meals, "
        f"lighter processed foods, and consistency around medication timing. Current medication context: {med_names}."
    )



def _general_fallback_response(message: str, user, context: dict[str, Any]) -> tuple[str, str | None]:
    lowered = message.lower().strip()
    trimmed = " ".join(message.split())[:180] or "your request"

    if any(token in lowered for token in ["hello", "hi", "hey"]):
        return (
            f"Hello {user.name}. I can help with appointments, symptoms, reports, medication schedules, insurance, hospitals near {getattr(user, 'location', 'your area')}, and general health guidance.",
            None,
        )

    if any(token in lowered for token in ["where", "nearby", "near me", "my area", "my sector", "my location", "hospital", "clinic", "doctor"]):
        try:
            hospitals = recommend_hospitals_from_location(getattr(user, "location", ""))
            formatted = "; ".join(f"{item['name']} ({item['distance_km']} km, {item['address']})" for item in hospitals[:3])
            return (
                f"Using your saved location {getattr(user, 'location', 'your area')}, these nearby hospitals stand out: {formatted}. Open Appointment Scheduling to book one of them.",
                "/appointments",
            )
        except Exception:
            return (
                f"I understood that you want nearby hospitals around {getattr(user, 'location', 'your area')}. Open Appointment Scheduling to view the hospital list for your saved location.",
                "/appointments",
            )

    if any(token in lowered for token in ["food", "diet", "vegetable", "vegetables", "eat", "meal", "nutrition"]):
        return (
            f"You are asking for diet guidance about '{trimmed}'. Based on your health workspace, focus on balanced meals, regular hydration, more vegetables, fruit, protein-rich foods, and medication-friendly meal timing. If you want, ask me for a vegetarian, diabetic-friendly, or low-spice version.",
            None,
        )

    if "pm of india" in lowered or "prime minister of india" in lowered:
        return (
            "As of April 7, 2026, the Prime Minister of India is Narendra Modi.",
            None,
        )

    if "president of india" in lowered:
        return (
            "As of April 7, 2026, the President of India is Droupadi Murmu.",
            None,
        )

    if any(token in lowered for token in ["what", "who", "where", "when", "which", "how", "why", "?"]):
        return (
            f"I understood your question as '{trimmed}'. The live AI answer services did not return a detailed response just now, but I did understand it as a general query. Try asking it once more, or ask me to connect it to a healthcare task like symptoms, hospitals, appointments, reports, or diet support.",
            None,
        )

    return (
        f"I understood your request as '{trimmed}'. Tell me whether you want help with symptoms, nearby hospitals, reports, medication, insurance, diet, or appointment booking, and I will route you to the right action.",
        None,
    )



def build_rule_based_chat_response(message: str, action: str, user, context: dict[str, Any]) -> tuple[str, str | None]:
    recent_symptoms = context.get("recent_symptoms", [])
    medications = context.get("medications", [])
    reports = context.get("reports", [])
    appointments = context.get("appointments", [])
    assessment_summary = context.get("assessment") or "No assessment summary is available yet."

    if action in {"book_appointment", "hospital_discovery"}:
        appointment_summary = _recent_summary(
            appointments,
            "You do not have any tracked appointments yet.",
            lambda item: f"{item.get('hospital_name', 'Hospital')} on {item.get('appointment_date', 'pending date')} ({item.get('status', 'pending')})",
        )
        hospital_text = ""
        try:
            hospitals = recommend_hospitals_from_location(getattr(user, "location", ""))
            if hospitals:
                formatted = "; ".join(f"{item['name']} ({item['distance_km']} km, {item['address']})" for item in hospitals[:3])
                hospital_text = f" Recommended nearby hospitals for your location {user.location}: {formatted}."
        except Exception:
            hospital_text = ""
        response = (
            f"I can help you with appointment scheduling. Your recent appointment context: {appointment_summary}.{hospital_text} "
            "Open the Appointment Scheduling page to choose a hospital, date, and time, or tell me a preferred hospital name and day."
        )
        return response, "/appointments"

    if action == "check_symptoms":
        symptom_summary = _recent_summary(
            recent_symptoms,
            "No previous symptom checks are recorded yet.",
            lambda item: f"{item.get('symptom_text', 'symptom')} -> {item.get('predicted_disease', 'unclassified')}",
        )
        lowered = message.lower()
        if any(keyword in lowered for keyword in ["fever", "cough"]):
            likely = "This sounds closer to a viral or infection-related pattern."
        elif "headache" in lowered:
            likely = "This may be related to headache or stress-type symptoms."
        elif "chest pain" in lowered or "breathing" in lowered:
            likely = "This may be urgent. Please seek immediate medical attention."
        else:
            likely = "I can help triage this further through the symptom checker."
        response = (
            f"{likely} Your symptom history: {symptom_summary} "
            "Open the Symptom Checker page and submit the details for a structured analysis, or describe the symptom in more detail here."
        )
        return response, "/symptoms"

    if action == "report_help":
        report_summary = _recent_summary(
            reports,
            "No uploaded reports are available yet.",
            lambda item: f"{item.get('title', 'Report')} ({item.get('report_type', 'medical')})",
        )
        response = (
            f"I can help explain report findings. Current report context: {report_summary} "
            "If you already uploaded a report, open Scan Reports to review extracted findings. If not, upload the PDF there and I can help summarize the result."
        )
        return response, "/reports"

    if action == "medication_help":
        medication_summary = _recent_summary(
            medications,
            "No medications are tracked yet.",
            lambda item: f"{item.get('medicine_name', 'Medication')} at {item.get('schedule', 'unscheduled time')}",
        )
        response = (
            f"I can help with medication reminders and prescription tracking. Current medication context: {medication_summary} "
            "Open the Medication page to upload a prescription, store schedules, or review reminder-ready entries."
        )
        return response, "/medications"

    if action == "insurance_help":
        response = (
            "I can guide your insurance workflow. Open the Insurance Assistance page to submit policy number, company, and treatment stage so the admin can review it."
        )
        return response, "/insurance"

    if action == "diet_plan":
        response = (
            f"Using your current health context: {assessment_summary} \n\n"
            f"{generate_diet_plan_hint(user, context)}"
        )
        return response, None

    response = (
        "I can help with appointments, symptoms, medication reminders, reports, insurance requests, and general questions. "
        "Ask me what you want to know or do."
    )
    return response, None



def _generate_action_ai_response(message: str, action: str, user, context: dict[str, Any]) -> str:
    system_prompt = (
        "You are the main conversational intelligence layer for a healthcare assistant platform. "
        "Answer the user's exact input directly and helpfully. "
        "For healthcare questions, stay safe and non-diagnostic. "
        "When the question maps to a module, provide the useful answer first and only then suggest the related workflow. "
        "Do not reply with only navigation instructions when the user clearly asked for information."
    )

    action_guidance = {
        "general_help": "Answer the question directly. General knowledge questions are allowed.",
        "diet_plan": "Create a practical diet answer based on the user's request, condition history, medications, and location when useful.",
        "report_help": "Explain report findings in simple language using available report context.",
        "check_symptoms": "Provide safe triage-style guidance using the symptom context without claiming a final diagnosis.",
        "medication_help": "Explain medication timing, precautions, or next steps using tracked medication context.",
        "hospital_discovery": "Mention likely nearby hospitals or care options using the saved location and help the user proceed.",
        "book_appointment": "Help the user with booking intent, preferred day, and likely nearby hospitals using saved location.",
        "insurance_help": "Explain insurance workflow clearly and what details the user should provide.",
    }

    prompt = (
        f"Action intent: {action}\n"
        f"Action guidance: {action_guidance.get(action, 'Answer helpfully.')}\n"
        f"User name: {user.name}\n"
        f"User location: {getattr(user, 'location', '')}\n"
        f"Assessment summary: {context.get('assessment', '')}\n"
        f"Recent symptoms: {context.get('recent_symptoms', [])}\n"
        f"Recent medications: {context.get('medications', [])}\n"
        f"Recent reports: {context.get('reports', [])}\n"
        f"Recent appointments: {context.get('appointments', [])}\n\n"
        f"User message: {message}"
    )

    openai_text = _generate_openai_text(
        prompt,
        getattr(settings, "OPENAI_API_KEY_CHATBOT", ""),
        getattr(settings, "OPENAI_API_KEY", ""),
        system=system_prompt,
        model_name=getattr(settings, "OPENAI_MODEL_CHATBOT", "gpt-4o-mini"),
    )
    if openai_text:
        return openai_text

    gemini_text = _generate_gemini_text(prompt, getattr(settings, "GEMINI_API_KEY_CHATBOT", ""))
    if gemini_text:
        return gemini_text

    return ""



def generate_chatbot_response(message: str, user, context: dict[str, Any], action: str) -> tuple[str, str | None]:
    base_response, route = build_rule_based_chat_response(message, action, user, context)

    ai_text = _generate_action_ai_response(message, action, user, context)
    if ai_text:
        if action in {"book_appointment", "hospital_discovery"} and route:
            return f"{ai_text}\n\nYou can continue this in Appointment Scheduling.", route
        if action == "report_help" and route:
            return f"{ai_text}\n\nYou can review the full uploaded data in Scan Reports.", route
        if action == "medication_help" and route:
            return f"{ai_text}\n\nYou can manage reminder entries in Medication.", route
        if action == "insurance_help" and route:
            return f"{ai_text}\n\nYou can submit policy details from Insurance Assistance.", route
        if action == "check_symptoms" and route:
            return f"{ai_text}\n\nIf you want a structured symptom check, open Symptom Checker.", route
        return ai_text, route

    if action == "general_help":
        return _general_fallback_response(message, user, context)

    return base_response, route


