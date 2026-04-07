import os
from datetime import timedelta
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

SECRET_KEY = os.getenv("SECRET_KEY", "unsafe-secret-key")
DEBUG = os.getenv("DEBUG", "False").lower() == "true"
ALLOWED_HOSTS = [host.strip() for host in os.getenv("ALLOWED_HOSTS", "*").split(",") if host.strip()]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "healthcare_assistant.urls"

TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]

WSGI_APPLICATION = "healthcare_assistant.wsgi.application"
ASGI_APPLICATION = "healthcare_assistant.asgi.application"

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "postgres"),
        "USER": os.getenv("DB_USER", "postgres"),
        "PASSWORD": os.getenv("DB_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "5432"),
        "CONN_MAX_AGE": 600,
        "OPTIONS": {"sslmode": os.getenv("DB_SSLMODE", "require")},
    }
}

if DATABASE_URL:
    from urllib.parse import urlparse

    parsed = urlparse(DATABASE_URL)
    DATABASES["default"] = {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": parsed.path.lstrip("/") or os.getenv("DB_NAME", "postgres"),
        "USER": parsed.username or os.getenv("DB_USER", "postgres"),
        "PASSWORD": parsed.password or os.getenv("DB_PASSWORD", ""),
        "HOST": parsed.hostname or os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": str(parsed.port or os.getenv("DB_PORT", "5432")),
        "CONN_MAX_AGE": 600,
        "OPTIONS": {"sslmode": os.getenv("DB_SSLMODE", "require")},
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Kolkata"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = "api.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ALLOWED_ORIGINS", "").split(",") if origin.strip()]

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "health-assistant@example.com")
ADMIN_NOTIFICATION_EMAIL = os.getenv("ADMIN_NOTIFICATION_EMAIL", "admin@example.com")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_KEY_CHATBOT = os.getenv("GEMINI_API_KEY_CHATBOT", GEMINI_API_KEY)
GEMINI_API_KEY_HOSPITAL = os.getenv("GEMINI_API_KEY_HOSPITAL", GEMINI_API_KEY)
GEMINI_API_KEY_MEDICATION = os.getenv("GEMINI_API_KEY_MEDICATION", GEMINI_API_KEY)
GEMINI_API_KEY_REPORT = os.getenv("GEMINI_API_KEY_REPORT", GEMINI_API_KEY)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_API_KEY_CHATBOT = os.getenv("OPENAI_API_KEY_CHATBOT", OPENAI_API_KEY)
OPENAI_MODEL_ASSESSMENT = os.getenv("OPENAI_MODEL_ASSESSMENT", "gpt-4.1-mini")
OPENAI_MODEL_CHATBOT = os.getenv("OPENAI_MODEL_CHATBOT", "gpt-4o-mini")
GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
ELEVENLABS_STT_MODEL_ID = os.getenv("ELEVENLABS_STT_MODEL_ID", "scribe_v2")
ELEVENLABS_STT_LANGUAGE_CODE = os.getenv("ELEVENLABS_STT_LANGUAGE_CODE", "en")
ELEVENLABS_TTS_MODEL_ID = os.getenv("ELEVENLABS_TTS_MODEL_ID", "eleven_multilingual_v2")
ELEVENLABS_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "")
FIREBASE_SERVER_KEY = os.getenv("FIREBASE_SERVER_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
