from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection
from users.models import UserMFASettings, UserSubscription, Profile
import time

class Command(BaseCommand):
    help = 'Initialize database with migrations and create superuser if needed'

    def handle(self, *args, **kwargs):
        try:
            # Wait for database to be ready
            max_retries = 5
            retry_count = 0
            while retry_count < max_retries:
                try:
                    connection.ensure_connection()
                    break
                except Exception as e:
                    retry_count += 1
                    if retry_count == max_retries:
                        raise e
                    self.stdout.write(f'Database not ready, retrying... ({retry_count}/{max_retries})')
                    time.sleep(2)

            # Run migrations
            self.stdout.write('Running migrations...')
            call_command('migrate')

            # Create superuser if it doesn't exist
            User = get_user_model()
            user = None
            if not User.objects.filter(username='admin').exists():
                self.stdout.write('Creating superuser...')
                user = User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='admin123'
                )
                self.stdout.write(self.style.SUCCESS('Superuser created successfully'))
            else:
                user = User.objects.get(username='admin')
                self.stdout.write('Superuser already exists')

            # Create related models for the superuser
            if user:
                # Create or update MFA settings
                UserMFASettings.objects.get_or_create(user=user, defaults={'mfa_enabled': False})

                # Create or update subscription
                UserSubscription.objects.get_or_create(user=user, defaults={
                    'is_premium': True,
                    'subscription_expiry': None
                })

                # Create or update profile
                Profile.objects.get_or_create(user=user)

            self.stdout.write(self.style.SUCCESS('Database initialization completed successfully'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error initializing database: {str(e)}'))
            raise e 