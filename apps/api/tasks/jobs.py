from zoneinfo import ZoneInfo

import django_rq
from django.utils import timezone

from .emails import send_task_mail
from .models import Task

KATHMANDU_TIMEZONE = ZoneInfo("Asia/Kathmandu")

def describe_minutes(minutes):
    if minutes % 1440 == 0:
        amount, unit = minutes // 1440, "day"
    elif minutes % 60 == 0:
        amount, unit = minutes // 60, "hour"
    else:
        amount, unit = minutes, "minute"
    return f"{amount} {unit}{'' if amount == 1 else 's'}"

def send_created_email(task_id: int):
    task = Task.objects.get(id=task_id)
    local_deadline = timezone.localtime(task.deadline, KATHMANDU_TIMEZONE)
    subject = f"Task Created: {task.header}"
    body = f"The task '{task.header}' has been created and assigned to you. Please complete it by {local_deadline.strftime('%Y-%m-%d %I:%M %p')}."
    send_task_mail(task, subject, body)


def send_completed_email(task_id: int):
    task = Task.objects.get(id=task_id)
    if task is None:
        return
    subject = f"Task Completed: {task.header}"
    body = f"The task '{task.header}' has been marked as completed."
    send_task_mail(task, subject, body)
    
def send_deadline_email(task_id: int):
    task = Task.objects.get(id=task_id)
    if task is None:
        return
    if task.status == Task.Status.COMPLETED:
        return  
    local_deadline = timezone.localtime(task.deadline, KATHMANDU_TIMEZONE)
    lead = describe_minutes(task.remind_before_minutes)
    subject = f"Task Deadline Approaching: {task.header}"
    body=f"This is the reminder you asked for, {lead} before the deadline.\nTask: {task.header}. Due: {local_deadline.strftime('%Y-%m-%d %I:%M %p')}\n.{task.description}"
    send_task_mail(task, subject, body)
    
def check_deadlines():
    now = timezone.now()
    due_task = Task.objects.filter(
        remind_at__lte=now,
        deadline__gt=now,
        notification_sent=False,
    ).exclude(status=Task.Status.COMPLETED)
    
    for task in due_task:
        django_rq.enqueue(send_deadline_email, task.id)
        task.notification_sent = True
        task.save(update_fields=["notification_sent"])