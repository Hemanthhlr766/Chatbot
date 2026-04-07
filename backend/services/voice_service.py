from __future__ import annotations

from typing import Any

import requests
from django.conf import settings

ELEVENLABS_STT_URL = "https://api.elevenlabs.io/v1/speech-to-text"
ELEVENLABS_TTS_URL_TEMPLATE = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"



def _build_headers(include_json: bool = False) -> dict[str, str]:
    headers = {"xi-api-key": settings.ELEVENLABS_API_KEY}
    if include_json:
        headers["Content-Type"] = "application/json"
        headers["Accept"] = "audio/mpeg"
    return headers



def speech_to_text(audio_file) -> str:
    if not settings.ELEVENLABS_API_KEY or not audio_file:
        return ""

    audio_file.seek(0)
    files = {
        "file": (getattr(audio_file, "name", "recording.webm"), audio_file.read(), getattr(audio_file, "content_type", "audio/webm")),
    }
    data = {
        "model_id": settings.ELEVENLABS_STT_MODEL_ID,
        "language_code": getattr(settings, "ELEVENLABS_STT_LANGUAGE_CODE", "en") or "en",
        "file_format": "other",
        "tag_audio_events": False,
    }

    response = requests.post(ELEVENLABS_STT_URL, headers=_build_headers(), data=data, files=files, timeout=60)
    response.raise_for_status()
    payload = response.json()
    return payload.get("text", "").strip()



def text_to_speech_bytes(text: str) -> bytes:
    if not settings.ELEVENLABS_API_KEY or not settings.ELEVENLABS_VOICE_ID or not text.strip():
        return b""

    payload: dict[str, Any] = {
        "text": text,
        "model_id": settings.ELEVENLABS_TTS_MODEL_ID,
        "voice_settings": {"stability": 0.45, "similarity_boost": 0.8},
    }

    response = requests.post(
        ELEVENLABS_TTS_URL_TEMPLATE.format(voice_id=settings.ELEVENLABS_VOICE_ID),
        headers=_build_headers(include_json=True),
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    return response.content
