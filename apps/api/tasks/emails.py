from django.conf import settings
from django.core.mail import send_mail

def send_task_mail(task, subject, body):
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[task.assignee_email],
        fail_silently=False,
    )