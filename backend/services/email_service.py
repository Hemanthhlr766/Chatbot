from django.conf import settings
from django.core.mail import send_mail


def send_admin_notification(subject: str, message: str) -> None:
    if not settings.ADMIN_NOTIFICATION_EMAIL:
        return
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [settings.ADMIN_NOTIFICATION_EMAIL], fail_silently=True)
    except Exception:
        return



def send_contact_message(name: str, email: str, subject: str, message: str) -> bool:
    if not settings.ADMIN_NOTIFICATION_EMAIL:
        return False
    body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [settings.ADMIN_NOTIFICATION_EMAIL], fail_silently=False)
        return True
    except Exception:
        return False



def send_appointment_email(recipient: str, appointment) -> None:
    subject = f"Appointment {appointment.status.title()}"
    message = f"Hospital: {appointment.hospital_name}\nDate: {appointment.appointment_date}\nTime: {appointment.appointment_time}\nStatus: {appointment.status}"
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=True)
    except Exception:
        return



def send_medication_reminder(medication) -> None:
    if medication.user.email:
        subject = f"Medication reminder for {medication.medicine_name}"
        message = f"Schedule: {medication.schedule}\nInstructions: {medication.instructions}"
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [medication.user.email], fail_silently=True)
            medication.reminder_email_sent = True
            medication.save(update_fields=["reminder_email_sent"])
        except Exception:
            return
