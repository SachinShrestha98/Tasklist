from ninja import Field, Schema
from pydantic import EmailStr
from .models import Task
from datetime import datetime   

class TaskIn(Schema):
    header: str = Field(min_length=1, max_length=200)
    description: str
    assignee_email : EmailStr
    deadline: datetime
    
class TaskUpdate(Schema):
    header: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    assignee_email: EmailStr | None = None
    deadline: datetime | None = None
    
class TaskOut(Schema):
    id: int
    header: str
    description: str
    assignee_email: EmailStr
    deadline: datetime
    status: str
    notification_sent: bool
    created_at: datetime
    
    
    

    