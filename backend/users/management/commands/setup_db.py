from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.contrib.auth import get_user_model
import sys

class Command(BaseCommand):
    help = 'Load initial data and create superuser'

    def handle(self, *args, **options):
        try:
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
            
            self.stdout.write(self.style.SUCCESS('Successfully loaded initial data'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
            # Print full traceback
            import traceback
            traceback.print_exc()
            sys.exit(1)  # Exit with error code 