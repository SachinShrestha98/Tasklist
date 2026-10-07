from django.db import models

class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        
    header = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    assignee_email = models.EmailField()
    deadline = models.DateTimeField() 
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    notification_sent = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.header
