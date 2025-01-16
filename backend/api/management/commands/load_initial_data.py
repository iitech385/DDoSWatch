from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Load initial data from JSON dump'

    def handle(self, *args, **options):
        # First run migrations
        self.stdout.write('Running migrations...')
        call_command('migrate', '--noinput')

        # Then load the data
        self.stdout.write('Loading data...')
        try:
            call_command('loaddata', 'data.json')
            self.stdout.write(self.style.SUCCESS('Successfully loaded data'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading data: {str(e)}')) 