from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection

class Command(BaseCommand):
    help = 'Initialize database with migrations and create superuser if needed'

    def handle(self, *args, **kwargs):
        try:
            # Run migrations
            self.stdout.write('Running migrations...')
            call_command('migrate')

            # Create superuser if it doesn't exist
            User = get_user_model()
            if not User.objects.filter(username='admin').exists():
                self.stdout.write('Creating superuser...')
                User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='admin123'
                )
                self.stdout.write(self.style.SUCCESS('Superuser created successfully'))
            else:
                self.stdout.write('Superuser already exists')

            self.stdout.write(self.style.SUCCESS('Database initialization completed successfully'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error initializing database: {e}')) 