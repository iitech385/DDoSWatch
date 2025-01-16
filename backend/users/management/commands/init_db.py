from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection
from users.models import UserMFASettings, UserSubscription, Profile
import time
import psycopg2
from django.conf import settings
import os

class Command(BaseCommand):
    help = 'Initialize database with migrations and create superuser if needed'

    def wait_for_db(self):
        """Wait for database to be available"""
        self.stdout.write('Waiting for database...')
        db_settings = settings.DATABASES['default']
        if 'postgres' in db_settings.get('ENGINE', ''):
            dbname = db_settings.get('NAME')
            user = db_settings.get('USER')
            password = db_settings.get('PASSWORD')
            host = db_settings.get('HOST')
            port = db_settings.get('PORT')

            for i in range(30):  # Try for 30 seconds
                try:
                    conn = psycopg2.connect(
                        dbname=dbname,
                        user=user,
                        password=password,
                        host=host,
                        port=port
                    )
                    conn.close()
                    self.stdout.write(self.style.SUCCESS('Database is ready!'))
                    return True
                except psycopg2.OperationalError:
                    self.stdout.write(f'Database not ready, waiting... ({i+1}/30)')
                    time.sleep(1)
            return False
        return True

    def check_table_exists(self, table_name):
        """Check if a table exists in the database"""
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT EXISTS (
                    SELECT 1 
                    FROM pg_tables 
                    WHERE tablename = %s
                );
            """, [table_name])
            return cursor.fetchone()[0]

    def handle(self, *args, **kwargs):
        try:
            # Wait for database
            if not self.wait_for_db():
                self.stdout.write(self.style.ERROR('Database connection failed after 30 seconds'))
                return

            # Run migrations
            self.stdout.write('Running migrations...')
            call_command('migrate')

            # Verify auth_user table exists
            if not self.check_table_exists('auth_user'):
                self.stdout.write('auth_user table not found, running migrations again...')
                call_command('migrate', 'auth', '--fake-initial')
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