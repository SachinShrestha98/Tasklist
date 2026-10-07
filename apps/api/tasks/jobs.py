from datetime import datetime
import django_rq
from django.utils import timezone

from .emails import send_task_mail
from .models import Task

def send_created_email(task_id: int):
    task = Task.objects.get(id=task_id)
    subject = f"Task Created: {task.header}"
    body = f"The task '{task.header}' has been created and assigned to you. Please complete it by {task.deadline}."
    send_task_mail(task, subject, body)


def send_completed_email(task_id: int):
    task = Task.objects.get(id=task_id)
    subject = f"Task Completed: {task.header}"
    body = f"The task '{task.header}' has been marked as completed."
    send_task_mail(task, subject, body)
    
def send_deadline_email(task_id: int):
    task = Task.objects.get(id=task_id)
    if task.status == Task.Status.COMPLETED:
        return  # Don't send email if the task is already completed
    subject = f"Task Deadline Approaching: {task.header}"
    body = f"The task '{task.header}' is approaching its deadline of {task.deadline}. Please ensure it is completed on time."
    send_task_mail(task, subject, body)
    
def check_deadlines():
    cutoff_time = timezone.now() + timezone.timedelta(hours=24)
    due_task = Task.objects.filter(deadline__lte=cutoff_time, status=Task.Status.PENDING, notification_sent=False)
    
    for task in due_task:
        django_rq.enqueue(send_deadline_email, task.id)
        task.notification_sent = True
        task.save(update_fields=["notification_sent"])