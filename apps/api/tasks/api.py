from datetime import datetime
from django.utils import timezone

from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError
from django.db.models import Q
from .models import Task
from .schemas import TaskIn, TaskOut, TaskUpdate
from .jobs import send_completed_email, send_created_email
import django_rq

router = Router()

def ensure_deadline_in_future(deadline: datetime):
    if timezone.is_naive(deadline):
        deadline = timezone.make_aware(deadline)
    if deadline <= timezone.now():
        raise HttpError(
            400,
            "The deadline is already in the past. Choose a later deadline.",
        )

@router.get("", response=list[TaskOut])
def list_tasks(request): 
    tasks = Task.objects.all()
    return tasks


@router.post("", response={201: TaskOut})
def create_task(request, payload: TaskIn):
    ensure_deadline_in_future(payload.deadline)
    task = Task.objects.create(**payload.dict())
    django_rq.enqueue(send_created_email, task.id)
    return task

@router.get("{task_id}/", response=TaskOut)
def get_task(request, task_id: int):
    task = get_object_or_404(Task, id = task_id)
    return task

@router.patch("{task_id}/", response={200: TaskUpdate})
def update_task(request, task_id: int , payload: TaskUpdate):
    task = get_object_or_404(Task, id = task_id)
    changes = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    for attr, value in changes.items():
        setattr(task, attr, value)
    if "deadline" in changes or "remind_before_minutes" in changes:
        ensure_deadline_in_future(task.deadline)
        task.notification_sent = False 
    task.save()
    return task

@router.post("{task_id}/complete/", response={200: TaskOut})
def complete_task(request, task_id: int):
    task = get_object_or_404(Task, id = task_id)
    if task.status != Task.Status.COMPLETED:
        task.status = Task.Status.COMPLETED
        task.save(update_fields=["status"])
        django_rq.enqueue(send_completed_email, task.id)
    return task

@router.delete("{task_id}/", response={204: None})
def delete_task(request, task_id: int):
    task = get_object_or_404(Task, id = task_id)
    task.delete()
    return 204
