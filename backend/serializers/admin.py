from rest_framework import serializers

from models import Alert, Assessment, ChatLog, InsuranceRequest, Medication, Report, SymptomLog, SystemConfiguration
from serializers.auth import UserSerializer



def _report_analysis_value(report, key, default):
    findings = getattr(report, "findings", None)
    if isinstance(findings, dict):
        return findings.get(key, default)
    if key == "health_issues" and isinstance(findings, list):
        return findings
    return default


class ChatLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ChatLog
        fields = "__all__"


class AlertSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Alert
        fields = "__all__"


class AssessmentAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Assessment
        fields = "__all__"


class InsuranceAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = InsuranceRequest
        fields = "__all__"


class SymptomAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SymptomLog
        fields = "__all__"


class MedicationAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Medication
        fields = "__all__"


class ReportAdminSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    analysis_summary = serializers.SerializerMethodField()
    health_issues = serializers.SerializerMethodField()
    recommendations = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = "__all__"

    def get_analysis_summary(self, obj):
        return _report_analysis_value(obj, "analysis_summary", "")

    def get_health_issues(self, obj):
        return _report_analysis_value(obj, "health_issues", [])

    def get_recommendations(self, obj):
        return _report_analysis_value(obj, "recommendations", [])


class SystemConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfiguration
        fields = "__all__"
