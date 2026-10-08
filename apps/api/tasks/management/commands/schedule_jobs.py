import os
import django_rq
from django.core.management.base import BaseCommand

from tasks.jobs import check_deadlines

JOB_ID = "check-deadlines"


class Command(BaseCommand):
    def handle(self, *args, **options):
        scheduler = django_rq.get_scheduler("default")
        if JOB_ID in scheduler:
            scheduler.cancel(JOB_ID)
        cron = os.environ.get("DEADLINE_CRON", "* * * * *")
        scheduler.cron(cron, func=check_deadlines, id=JOB_ID, repeat=None)
        self.stdout.write(self.style.SUCCESS(f"Scheduled {JOB_ID} with cron '{cron}'"))