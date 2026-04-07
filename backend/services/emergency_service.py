EMERGENCY_KEYWORDS = ["chest pain", "breathing issue", "shortness of breath", "difficulty breathing", "severe bleeding"]


def detect_emergency(message: str) -> str:
    lowered = message.lower()
    for keyword in EMERGENCY_KEYWORDS:
        if keyword in lowered:
            return f"Immediate Attention Required: detected emergency symptom '{keyword}'."
    return ""
