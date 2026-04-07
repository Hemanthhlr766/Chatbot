from django.contrib import admin

from models import Alert, Appointment, Assessment, ChatLog, InsuranceRequest, Medication, Report, SymptomLog, SystemConfiguration, User

admin.site.register(User)
admin.site.register(Assessment)
admin.site.register(SymptomLog)
admin.site.register(Appointment)
admin.site.register(ChatLog)
admin.site.register(Alert)
admin.site.register(InsuranceRequest)
admin.site.register(Medication)
admin.site.register(Report)
admin.site.register(SystemConfiguration)
