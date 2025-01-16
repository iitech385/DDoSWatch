from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection

class Command(BaseCommand):
    help = 'Initialize database and create superuser'

    def handle(self, *args, **options):
        self.stdout.write('Running migrations...')
        call_command('migrate', '--noinput')
        
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            self.stdout.write('Creating superuser...')
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                is_active=True,
                is_staff=True
            )
            self.stdout.write(self.style.SUCCESS('Superuser created successfully')) 