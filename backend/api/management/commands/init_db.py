from django.core.management.base import BaseCommand
from django.db import connection
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Initialize database tables and create superuser'

    def handle(self, *args, **options):
        self.stdout.write('Creating database tables...')
        
        with connection.cursor() as cursor:
            # Check if auth_user table exists
            cursor.execute("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'auth_user'
                );
            """)
            exists = cursor.fetchone()[0]
            
            if not exists:
                # Create auth tables
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS auth_user (
                        id serial PRIMARY KEY,
                        password varchar(128) NOT NULL,
                        last_login timestamp with time zone,
                        is_superuser boolean NOT NULL,
                        username varchar(150) NOT NULL UNIQUE,
                        first_name varchar(150) NOT NULL,
                        last_name varchar(150) NOT NULL,
                        email varchar(254) NOT NULL,
                        is_staff boolean NOT NULL,
                        is_active boolean NOT NULL,
                        date_joined timestamp with time zone NOT NULL
                    );
                """)
                
                # Create default superuser
                User.objects.create_superuser(
                    username='admin',
                    email='admin@example.com',
                    password='admin123'
                )
                
                self.stdout.write(self.style.SUCCESS('Successfully created auth_user table and superuser')) 