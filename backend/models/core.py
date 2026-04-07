from django.contrib.auth.models import AbstractUser, UserManager
from django.db import models


class HealthcareUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", "admin")
        extra_fields.setdefault("name", username)
        user = super().create_superuser(username=username, email=email, password=password, **extra_fields)
        user.role = "admin"
        user.is_staff = True
        user.is_superuser = True
        user.save(update_fields=["role", "is_staff", "is_superuser"])
        return user


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class User(AbstractUser):
    ROLE_CHOICES = (("user", "User"), ("admin", "Admin"))
    GENDER_CHOICES = (("male", "Male"), ("female", "Female"), ("other", "Other"))

    name = models.CharField(max_length=150)
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    mobile_number = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="user")
    first_login_completed = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)

    objects = HealthcareUserManager()
    REQUIRED_FIELDS = ["email", "name"]

    class Meta:
        app_label = "api"

    def save(self, *args, **kwargs):
        if self.is_superuser or self.is_staff:
            self.role = "admin"
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.username


class Assessment(TimestampedModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="assessment")
    is_previously_treated = models.BooleanField(default=False)
    disease_history = models.TextField(blank=True)
    extracted_document_text = models.TextField(blank=True)
    generated_questions = models.JSONField(default=list, blank=True)
    answers = models.JSONField(default=dict, blank=True)
    summary = models.TextField(blank=True)

    class Meta:
        app_label = "api"


class SymptomLog(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="symptoms")
    symptom_text = models.TextField()
    predicted_disease = models.CharField(max_length=255, blank=True)
    suggestions = models.JSONField(default=list, blank=True)
    confidence_score = models.FloatField(default=0.0)
    source = models.CharField(max_length=20, default="text")

    class Meta:
        app_label = "api"


class Appointment(TimestampedModel):
    STATUS_CHOICES = (("pending", "Pending"), ("approved", "Approved"), ("cancelled", "Cancelled"), ("rescheduled", "Rescheduled"))

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="appointments")
    hospital_name = models.CharField(max_length=255)
    hospital_address = models.CharField(max_length=255, blank=True)
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    class Meta:
        app_label = "api"


class ChatLog(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_logs")
    user_message = models.TextField()
    bot_response = models.TextField()
    action_triggered = models.CharField(max_length=100, blank=True)

    class Meta:
        app_label = "api"


class Alert(TimestampedModel):
    STATUS_CHOICES = (("open", "Open"), ("reviewed", "Reviewed"))

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="alerts")
    message = models.TextField()
    severity = models.CharField(max_length=20, default="critical")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")

    class Meta:
        app_label = "api"


class InsuranceRequest(TimestampedModel):
    TREATMENT_CHOICES = (("pre", "Pre-Treatment"), ("post", "Post-Treatment"))

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="insurance_requests")
    policy_number = models.CharField(max_length=100)
    policy_company = models.CharField(max_length=255)
    treatment_stage = models.CharField(max_length=20, choices=TREATMENT_CHOICES)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, default="pending")

    class Meta:
        app_label = "api"


class Medication(TimestampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="medications")
    medicine_name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100, blank=True)
    schedule = models.CharField(max_length=255)
    instructions = models.TextField(blank=True)
    extracted_source_text = models.TextField(blank=True)
    reminder_email_sent = models.BooleanField(default=False)

    class Meta:
        app_label = "api"


class Report(TimestampedModel):
    REPORT_TYPES = (("medical", "Medical Report"), ("medication", "Medication"), ("assessment", "Assessment"))

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports")
    title = models.CharField(max_length=255)
    report_type = models.CharField(max_length=30, choices=REPORT_TYPES, default="medical")
    file = models.FileField(upload_to="reports/", blank=True, null=True)
    extracted_text = models.TextField(blank=True)
    findings = models.JSONField(default=list, blank=True)

    class Meta:
        app_label = "api"
