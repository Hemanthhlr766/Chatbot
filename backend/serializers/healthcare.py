from rest_framework import serializers

from models import Appointment, Assessment, InsuranceRequest, Medication, Report, SymptomLog
from serializers.auth import UserSerializer



def _report_analysis_value(report, key, default):
    findings = getattr(report, "findings", None)
    if isinstance(findings, dict):
        return findings.get(key, default)
    if key == "health_issues" and isinstance(findings, list):
        return findings
    return default


class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = "__all__"
        read_only_fields = ["user"]


class SymptomLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomLog
        fields = "__all__"
        read_only_fields = ["user", "predicted_disease", "suggestions", "confidence_score"]


class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = "__all__"
        read_only_fields = ["user", "status"]


class AppointmentAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = "__all__"


class InsuranceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceRequest
        fields = "__all__"
        read_only_fields = ["user", "status"]


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = "__all__"
        read_only_fields = ["user", "extracted_source_text", "reminder_email_sent"]


class ReportSerializer(serializers.ModelSerializer):
    analysis_summary = serializers.SerializerMethodField()
    health_issues = serializers.SerializerMethodField()
    recommendations = serializers.SerializerMethodField()
    source_excerpt = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = "__all__"
        read_only_fields = ["user", "extracted_text", "findings", "analysis_summary", "health_issues", "recommendations", "source_excerpt"]

    def get_analysis_summary(self, obj):
        return _report_analysis_value(obj, "analysis_summary", "")

    def get_health_issues(self, obj):
        return _report_analysis_value(obj, "health_issues", [])

    def get_recommendations(self, obj):
        return _report_analysis_value(obj, "recommendations", [])

    def get_source_excerpt(self, obj):
        return _report_analysis_value(obj, "source_excerpt", (obj.extracted_text or "")[:500])
