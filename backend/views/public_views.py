from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from services.email_service import send_contact_message


class ContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        name = request.data.get("name", "").strip()
        email = request.data.get("email", "").strip()
        subject = request.data.get("subject", "").strip()
        message = request.data.get("message", "").strip()

        if not all([name, email, subject, message]):
            return Response({"detail": "All contact form fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        sent = send_contact_message(name=name, email=email, subject=subject, message=message)
        if not sent:
            return Response({"detail": "Unable to send your message right now."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"detail": "Your message has been sent successfully."}, status=status.HTTP_200_OK)
