from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection
import sys
import time

class Command(BaseCommand):
    help = 'Setup database and load initial data'

    def wait_for_db(self):
        """Wait for database to be available"""
        self.stdout.write('Waiting for database...')
        db_conn = None
        for i in range(60):  # Wait up to 60 seconds
            try:
                connection.ensure_connection()
                db_conn = True
                break
            except Exception as e:
                self.stdout.write(f'Database unavailable, waiting 1 second... ({str(e)})')
                time.sleep(1)
        return db_conn

    def handle(self, *args, **options):
        try:
            # Wait for database to be ready
            if not self.wait_for_db():
                self.stdout.write(self.style.ERROR('Database unavailable!'))
                sys.exit(1)

            # Run migrations
            self.stdout.write('Running migrations...')
            call_command('migrate', verbosity=2)

            # Verify tables exist
            with connection.cursor() as cursor:
                tables = ['auth_user', 'users_profile', 'users_usersubscription', 'users_usermfasettings']
                for table in tables:
                    cursor.execute(f"""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_schema = 'public'
                            AND table_name = %s
                        );
                    """, [table])
                    if not cursor.fetchone()[0]:
                        self.stdout.write(self.style.ERROR(f'{table} table does not exist after migrations!'))
                        sys.exit(1)
                    self.stdout.write(f'{table} table exists')

            # Create a default superuser
            User = get_user_model()
            if not User.objects.filter(is_superuser=True).exists():
                self.stdout.write('Creating default superuser...')
                admin = User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='admin123',
                    is_active=True,
                    is_staff=True
                )
                # Create related models
                from users.models import Profile, UserSubscription, UserMFASettings
                Profile.objects.create(user=admin, avatar='')
                UserSubscription.objects.create(user=admin, is_premium=True)
                UserMFASettings.objects.create(user=admin, mfa_enabled=False)
                self.stdout.write('Created default superuser with related models')

            self.stdout.write(self.style.SUCCESS('Successfully setup database'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            import traceback
            traceback.print_exc()
            sys.exit(1)  # Exit with error code 