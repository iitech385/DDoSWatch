from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
from django.db import connection
import sys

class Command(BaseCommand):
    help = 'Setup database and load initial data'

    def handle(self, *args, **options):
        try:
            # Ensure migrations are applied
            self.stdout.write('Running migrations...')
            call_command('migrate', verbosity=2)
            
            # Verify auth_user table exists
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'auth_user'
                    );
                """)
                table_exists = cursor.fetchone()[0]
                
                if not table_exists:
                    self.stdout.write(self.style.ERROR('auth_user table does not exist after migrations!'))
                    sys.exit(1)
                else:
                    self.stdout.write('auth_user table exists')

            # Load data from data.json
            self.stdout.write('Loading data from data.json...')
            call_command('loaddata', 'data.json')
            
            # Create a default superuser if no users exist
            User = get_user_model()
            if not User.objects.filter(username='admin').exists():
                self.stdout.write('Creating default superuser...')
                User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='admin123',
                    is_active=True,
                    is_staff=True
                )
            
            self.stdout.write(self.style.SUCCESS('Successfully setup database and loaded initial data'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            # Print full traceback
            import traceback
            traceback.print_exc()
            sys.exit(1)  # Exit with error code 