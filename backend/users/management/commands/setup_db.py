from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Setup database tables and load initial data'

    def handle(self, *args, **options):
        try:
            # Create necessary tables first
            with connection.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS auth_user (
                        id SERIAL PRIMARY KEY,
                        password VARCHAR(128) NOT NULL,
                        last_login TIMESTAMP WITH TIME ZONE,
                        is_superuser BOOLEAN NOT NULL,
                        username VARCHAR(150) NOT NULL UNIQUE,
                        first_name VARCHAR(150) NOT NULL,
                        last_name VARCHAR(150) NOT NULL,
                        email VARCHAR(254) NOT NULL,
                        is_staff BOOLEAN NOT NULL,
                        is_active BOOLEAN NOT NULL,
                        date_joined TIMESTAMP WITH TIME ZONE NOT NULL
                    );
                    
                    CREATE TABLE IF NOT EXISTS django_migrations (
                        id SERIAL PRIMARY KEY,
                        app VARCHAR(255) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        applied TIMESTAMP WITH TIME ZONE NOT NULL
                    );
                    
                    CREATE TABLE IF NOT EXISTS django_content_type (
                        id SERIAL PRIMARY KEY,
                        app_label VARCHAR(100) NOT NULL,
                        model VARCHAR(100) NOT NULL,
                        CONSTRAINT django_content_type_app_label_model_key UNIQUE (app_label, model)
                    );
                """)

            # Run migrations
            self.stdout.write('Running migrations...')
            call_command('migrate')
            
            # Load data from data.json
            self.stdout.write('Loading data from data.json...')
            call_command('loaddata', 'data.json')
            
            # Create a default superuser if no users exist
            User = get_user_model()
            if not User.objects.filter(username='admin').exists():
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