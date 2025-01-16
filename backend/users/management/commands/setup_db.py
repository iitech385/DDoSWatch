from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection

class Command(BaseCommand):
    help = 'Setup database tables and load initial data'

    def handle(self, *args, **options):
        try:
            # Run migrations first
            self.stdout.write('Running migrations...')
            call_command('migrate')
            
            # Load data from data.json
            self.stdout.write('Loading data from data.json...')
            call_command('loaddata', 'data.json')
            
            self.stdout.write(self.style.SUCCESS('Successfully setup database and loaded initial data'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}')) 