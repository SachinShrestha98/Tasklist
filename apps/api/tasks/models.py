from datetime import timedelta

from django.db import models
from django.utils import timezone

class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        
    header = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignee_email = models.EmailField()
    deadline = models.DateTimeField() 
    remind_before_minutes = models.PositiveIntegerField(default=60)
    remind_at = models.DateTimeField(default=timezone.now, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notification_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        self.remind_at = self.deadline - timedelta(minutes=self.remind_before_minutes)
        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            kwargs["update_fields"] = {*update_fields, "remind_at"}
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.header
