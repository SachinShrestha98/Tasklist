from django.shortcuts import get_object_or_404
from ninja import Router
from .models import Task
from .schemas import TaskIn, TaskOut, TaskUpdate

router = Router()

@router.get("", response=list[TaskOut])
def list_tasks(request):
    return Task.objects.all()

@router.post("", response={201: TaskOut})
def create_task(request, payload: TaskIn):
    task = Task.objects.create(**payload.dict())
    return task

@router.get("/{task_id}", response=TaskOut)
def get_task(request, task_id: int):
    task = get_object_or_404(Task, id = task_id)
    return task

@router.patch("/{task_id}", response={200: TaskUpdate})
def update_task(request, task_id: int , payload: TaskUpdate):
    task = get_object_or_404(Task, id = task_id)
    for attr, value in payload.dict(exclude_unset=True).items():
        setattr(task, attr, value)
    task.save()
    return task

@router.post("/{task_id}/complete", response={200: TaskOut})
def complete_task(request, task_id: int):
    task = get_object_or_404(Task, id = task_id)
    if task.status != Task.Status.COMPLETED:
        task.status = Task.Status.COMPLETED
        task.save(update_fields=["status"])
    return task

@router.delete("/{task_id}", response={204: None})
def delete_task(request, task_id: int):
    task = get_object_or_404(Task, id = task_id)
    task.delete()
    return 204
