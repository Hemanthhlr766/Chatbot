from django.db import models


class SystemConfiguration(models.Model):
    gemini_model = models.CharField(max_length=100, default="gemini-1.5-flash")
    assessment_model = models.CharField(max_length=100, default="gpt-4.1-mini")
    emergency_notifications_enabled = models.BooleanField(default=True)
    email_notifications_enabled = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = "api"

    def __str__(self):
        return "System Configuration"
