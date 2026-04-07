# Health Care Assistant Chatbot

A full-stack healthcare support platform with a React frontend, Django REST backend, MySQL database, AI-assisted workflows, voice interaction, PDF report analysis, appointment management, and role-based user/admin supervision.

## 1. Project Overview

The system is designed as a healthcare SaaS-style application with two major roles:

- User: can register, log in, complete medical onboarding, check symptoms, upload reports, manage medication, request insurance help, book appointments, and interact with the AI assistant.
- Admin: has full supervisory access to user activity, reports, appointments, alerts, analytics, and system settings, but cannot act as a patient for diagnosis workflows.

The chatbot is the central assistant of the platform. It is available as a full-page module and a floating assistant and is connected to symptoms, reports, medication, appointments, hospitals, and user history.

## 2. Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Custom glassmorphism UI with light/dark theming

### Backend
- Django
- Django REST Framework
- Simple JWT
- django-cors-headers

### Database
- MySQL

### AI and Integrations
- Gemini API for symptom-related analysis, hospital suggestions, medication/report intelligence, and fallback assistant flows
- OpenAI API for onboarding assessment generation and chatbot conversational intelligence
- ElevenLabs for speech-to-text and optional text-to-speech
- SMTP for email notifications and contact form delivery
- PyPDF2 for PDF text extraction

## 3. Project Structure

```text
project-root/
+-- backend/
¦   +-- api/
¦   +-- healthcare_assistant/
¦   +-- models/
¦   +-- serializers/
¦   +-- services/
¦   +-- views/
¦   +-- manage.py
¦   +-- requirements.txt
+-- frontend/
¦   +-- src/
¦   ¦   +-- components/
¦   ¦   +-- pages/
¦   ¦   +-- services/
¦   ¦   +-- App.js
¦   ¦   +-- styles.css
+-- README.md
```

## 4. Core Features

### Public Pages
- Home page with healthcare product introduction
- About page with system overview
- Contact page with SMTP-based contact form
- Login and Register pages with premium UI and theme support

### Authentication
- Registration fields:
  - Name
  - Age
  - Gender
  - Username
  - Password
  - Mobile Number
  - Email
  - Location
- JWT login with username and password
- Role-based access: `user` and `admin`
- Django `createsuperuser` maps to full admin access in the platform

### User Module
- First-login assessment flow
- Previous-treatment onboarding with history and PDF support
- Symptom checker with text and voice input
- Appointment scheduling with location-aware hospital suggestions
- Medication management and reminder-ready schedule tracking
- Medical report PDF upload and extracted issue analysis
- Insurance assistance request submission
- Stats dashboard
- AI assistant integrated across modules

### Admin Module
- Dashboard with KPIs and trend monitoring
- User supervision and profile inspection
- Assessment review
- Symptom monitoring
- Medication monitoring
- Report monitoring
- Appointment approval/cancel workflow
- Insurance request supervision
- Chat log monitoring
- Emergency alerts
- System control view

## 5. Frontend Routes

### Public Routes
- `/`
- `/about`
- `/contact`
- `/login`
- `/register`

### User Routes
- `/dashboard`
- `/symptoms`
- `/appointments`
- `/medications`
- `/reports`
- `/insurance`
- `/stats`
- `/chatbot`

### Admin Routes
- `/admin`
- `/admin/users`
- `/admin/assessments`
- `/admin/symptoms`
- `/admin/medications`
- `/admin/reports`
- `/admin/insurance`
- `/admin/appointments`
- `/admin/logs`
- `/admin/analytics`
- `/admin/alerts`
- `/admin/system-control`

## 6. Backend API Endpoints

### Public
- `POST /api/public/contact`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### User
- `GET /api/user/profile`
- `GET, POST /api/user/assessment`
- `GET, POST /api/user/symptoms`
- `GET /api/user/hospitals`
- `GET, POST /api/user/appointments`
- `PATCH /api/user/appointments/<appointment_id>`
- `GET, POST /api/user/medications`
- `GET, POST /api/user/reports`
- `GET, POST /api/user/insurance`
- `POST /api/user/chatbot`
- `POST /api/user/voice/transcribe`
- `POST /api/user/voice/speak`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/users/<user_id>`
- `PATCH /api/admin/users`
- `GET /api/admin/assessments`
- `GET /api/admin/symptoms`
- `GET /api/admin/medications`
- `GET /api/admin/reports`
- `GET /api/admin/insurance`
- `GET, PATCH /api/admin/appointments`
- `GET /api/admin/logs`
- `GET /api/admin/analytics`
- `GET /api/admin/alerts`
- `GET, PATCH /api/admin/system-control`

## 7. Main Backend Modules

### Models
Located mainly in [backend/models/core.py](E:/New%20folder/Health_chatbot/backend/models/core.py) and [backend/models/system.py](E:/New%20folder/Health_chatbot/backend/models/system.py).

Key entities:
- User
- Assessment
- SymptomLog
- Appointment
- Medication
- Report
- InsuranceRequest
- ChatLog
- Alert
- SystemConfiguration

### Services
- [ai_service.py](E:/New%20folder/Health_chatbot/backend/services/ai_service.py)
  - onboarding assessment generation
  - symptom prediction support
  - chatbot response logic
  - report analysis
  - hospital recommendation generation
- [pdf_service.py](E:/New%20folder/Health_chatbot/backend/services/pdf_service.py)
  - PDF text extraction
- [voice_service.py](E:/New%20folder/Health_chatbot/backend/services/voice_service.py)
  - ElevenLabs speech-to-text and text-to-speech
- [email_service.py](E:/New%20folder/Health_chatbot/backend/services/email_service.py)
  - appointment and admin emails
- [emergency_service.py](E:/New%20folder/Health_chatbot/backend/services/emergency_service.py)
  - emergency symptom detection

## 8. Main Frontend Modules

### Layout and Navigation
- [App.js](E:/New%20folder/Health_chatbot/frontend/src/App.js)
- [AppShell.js](E:/New%20folder/Health_chatbot/frontend/src/components/AppShell.js)
- [PublicLayout.js](E:/New%20folder/Health_chatbot/frontend/src/components/PublicLayout.js)
- [PublicNavbar.js](E:/New%20folder/Health_chatbot/frontend/src/components/PublicNavbar.js)

### Shared UI
- [PageHeader.js](E:/New%20folder/Health_chatbot/frontend/src/components/PageHeader.js)
- [FloatingChatbot.js](E:/New%20folder/Health_chatbot/frontend/src/components/FloatingChatbot.js)
- [VoiceInputButton.js](E:/New%20folder/Health_chatbot/frontend/src/components/VoiceInputButton.js)
- [AppIcon.js](E:/New%20folder/Health_chatbot/frontend/src/components/AppIcon.js)

### API Layer
- [api.js](E:/New%20folder/Health_chatbot/frontend/src/services/api.js)
- [AuthContext.js](E:/New%20folder/Health_chatbot/frontend/src/services/AuthContext.js)

## 9. Environment Configuration

Create:
- [backend/.env](E:/New%20folder/Health_chatbot/backend/.env)
- [frontend/.env](E:/New%20folder/Health_chatbot/frontend/.env)

### Backend `.env` example

```env
SECRET_KEY=your_secret_key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:3000

DB_NAME=health_chatbot
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=Health Assistant <your_email@gmail.com>
ADMIN_NOTIFICATION_EMAIL=admin@example.com

GEMINI_API_KEY=your_gemini_key
GEMINI_API_KEY_CHATBOT=your_chatbot_gemini_key
GEMINI_API_KEY_HOSPITAL=your_hospital_gemini_key
GEMINI_API_KEY_MEDICATION=your_medication_gemini_key
GEMINI_API_KEY_REPORT=your_report_gemini_key

OPENAI_API_KEY=your_openai_key_for_assessment
OPENAI_API_KEY_CHATBOT=your_openai_key_for_chatbot
OPENAI_MODEL_ASSESSMENT=gpt-4.1-mini
OPENAI_MODEL_CHATBOT=gpt-4o-mini

GOOGLE_MAPS_API_KEY=your_google_maps_key

ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_STT_MODEL_ID=scribe_v2
ELEVENLABS_STT_LANGUAGE_CODE=en
ELEVENLABS_TTS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_VOICE_ID=your_voice_id
```

### Frontend `.env`

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

## 10. Installation and Setup

### Backend Setup

```powershell
cd "E:\New folder\Health_chatbot\backend"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py makemigrations api
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

If `python` is not available, use the Python executable you normally use on your machine.

### Frontend Setup

```powershell
cd "E:\New folder\Health_chatbot\frontend"
npm install
copy .env.example .env
npm start
```

## 11. Functional Workflow

### User Onboarding
1. User registers.
2. User logs in.
3. On first login, assessment flow begins.
4. User chooses whether previously treated or first time.
5. If previously treated, they can upload supporting documents and provide history.
6. Assessment questions are generated and stored.

### Symptom Checker
1. User enters text or voice.
2. Voice is transcribed through ElevenLabs STT.
3. Backend analyzes symptom text.
4. Predicted issue, suggestions, and confidence score are returned.

### Report Upload and Analysis
1. User uploads a PDF report.
2. Backend extracts text from the PDF.
3. AI and fallback heuristics analyze the extracted text.
4. Report stores:
   - extracted text
   - analysis summary
   - health issues
   - recommendations
5. User and admin can review the result.

### Appointment Flow
1. System reads the user’s saved location.
2. Hospital recommendations are generated.
3. User selects hospital, date, and time.
4. Appointment request is saved.
5. Admin can approve, reject, or update status.
6. Email notification can be sent.

### Chatbot Flow
1. User sends text or voice message.
2. Voice input is transcribed to text.
3. Chatbot detects intent.
4. For general conversation, OpenAI and Gemini can be used.
5. For healthcare modules, contextual app-aware replies are generated.
6. Route suggestions may be returned for related pages.
7. Chat logs are saved.

## 12. Security

- JWT-based authentication
- Password hashing via Django auth system
- Role-based access control
- Secrets stored through `.env`
- Admin restricted from patient-only diagnosis workflows

## 13. Current Notes

- Text-to-speech requires `ELEVENLABS_VOICE_ID`
- Voice transcription is configured for English by default
- Nearby hospitals currently depend on the saved user location and AI-generated hospital suggestions
- Cloud deployment keys and service permissions must be configured per environment

## 14. Suggested Submission Summary

This project delivers a premium healthcare assistant platform with:
- AI-assisted patient support
- Admin supervision and system control
- Voice interaction
- PDF report intelligence
- Appointment workflows
- Insurance and medication modules
- Analytics-ready architecture

## 15. Important Files

- [README.md](E:/New%20folder/Health_chatbot/README.md)
- [backend/healthcare_assistant/settings.py](E:/New%20folder/Health_chatbot/backend/healthcare_assistant/settings.py)
- [backend/api/urls.py](E:/New%20folder/Health_chatbot/backend/api/urls.py)
- [backend/views/user_views.py](E:/New%20folder/Health_chatbot/backend/views/user_views.py)
- [backend/views/admin_views.py](E:/New%20folder/Health_chatbot/backend/views/admin_views.py)
- [backend/services/ai_service.py](E:/New%20folder/Health_chatbot/backend/services/ai_service.py)
- [frontend/src/App.js](E:/New%20folder/Health_chatbot/frontend/src/App.js)
- [frontend/src/services/api.js](E:/New%20folder/Health_chatbot/frontend/src/services/api.js)
- [frontend/src/styles.css](E:/New%20folder/Health_chatbot/frontend/src/styles.css)
