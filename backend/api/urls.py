from django.urls import path

from views.admin_views import AdminAlertsView, AdminAnalyticsView, AdminAppointmentListView, AdminAssessmentsView, AdminDashboardView, AdminInsuranceView, AdminLogsView, AdminMedicationsView, AdminReportsView, AdminSymptomsView, AdminSystemControlView, AdminUserDetailView, AdminUserListView
from views.auth_views import LoginView, RegisterView
from views.public_views import ContactView
from views.user_views import AppointmentListCreateView, AppointmentStatusUpdateView, AssessmentView, ChatbotView, InsuranceRequestCreateView, MedicationListCreateView, NearbyHospitalsView, ProfileView, ReportListCreateView, SymptomCheckerView, VoiceSynthesisView, VoiceTranscriptionView

urlpatterns = [
    path("auth/register", RegisterView.as_view(), name="register"),
    path("auth/login", LoginView.as_view(), name="login"),
    path("public/contact", ContactView.as_view(), name="public-contact"),
    path("user/profile", ProfileView.as_view(), name="profile"),
    path("user/assessment", AssessmentView.as_view(), name="assessment"),
    path("user/symptoms", SymptomCheckerView.as_view(), name="symptoms"),
    path("user/hospitals", NearbyHospitalsView.as_view(), name="nearby-hospitals"),
    path("user/appointments", AppointmentListCreateView.as_view(), name="appointments"),
    path("user/appointments/<int:appointment_id>", AppointmentStatusUpdateView.as_view(), name="appointment-update"),
    path("user/medications", MedicationListCreateView.as_view(), name="medications"),
    path("user/reports", ReportListCreateView.as_view(), name="reports"),
    path("user/insurance", InsuranceRequestCreateView.as_view(), name="insurance"),
    path("user/chatbot", ChatbotView.as_view(), name="chatbot"),
    path("user/voice/transcribe", VoiceTranscriptionView.as_view(), name="voice-transcribe"),
    path("user/voice/speak", VoiceSynthesisView.as_view(), name="voice-speak"),
    path("admin/dashboard", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/users", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path("admin/assessments", AdminAssessmentsView.as_view(), name="admin-assessments"),
    path("admin/symptoms", AdminSymptomsView.as_view(), name="admin-symptoms"),
    path("admin/medications", AdminMedicationsView.as_view(), name="admin-medications"),
    path("admin/reports", AdminReportsView.as_view(), name="admin-reports"),
    path("admin/insurance", AdminInsuranceView.as_view(), name="admin-insurance"),
    path("admin/appointments", AdminAppointmentListView.as_view(), name="admin-appointments"),
    path("admin/logs", AdminLogsView.as_view(), name="admin-logs"),
    path("admin/analytics", AdminAnalyticsView.as_view(), name="admin-analytics"),
    path("admin/alerts", AdminAlertsView.as_view(), name="admin-alerts"),
    path("admin/system-control", AdminSystemControlView.as_view(), name="admin-system-control"),
]
