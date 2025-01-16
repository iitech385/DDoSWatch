from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import connection
from django.contrib.auth import get_user_model
import sys

class Command(BaseCommand):
    help = 'Setup database tables and load initial data'

    def handle(self, *args, **options):
        try:
            # Create necessary tables first
            with connection.cursor() as cursor:
                self.stdout.write('Creating base tables...')
                
                # Drop tables if they exist to ensure clean state
                cursor.execute("""
                    DROP TABLE IF EXISTS users_usermfasettings CASCADE;
                    DROP TABLE IF EXISTS users_usersubscription CASCADE;
                    DROP TABLE IF EXISTS users_profile CASCADE;
                    DROP TABLE IF EXISTS django_admin_log CASCADE;
                    DROP TABLE IF EXISTS auth_user_user_permissions CASCADE;
                    DROP TABLE IF EXISTS auth_user_groups CASCADE;
                    DROP TABLE IF EXISTS auth_user CASCADE;
                    DROP TABLE IF EXISTS auth_group_permissions CASCADE;
                    DROP TABLE IF EXISTS auth_group CASCADE;
                    DROP TABLE IF EXISTS auth_permission CASCADE;
                    DROP TABLE IF EXISTS django_content_type CASCADE;
                    DROP TABLE IF EXISTS django_migrations CASCADE;
                    DROP TABLE IF EXISTS django_session CASCADE;
                """)
                self.stdout.write('Dropped existing tables')

                # Create tables in correct order
                cursor.execute("""
                    CREATE TABLE django_content_type (
                        id SERIAL PRIMARY KEY,
                        app_label VARCHAR(100) NOT NULL,
                        model VARCHAR(100) NOT NULL,
                        CONSTRAINT django_content_type_app_label_model_key UNIQUE (app_label, model)
                    );
                """)
                self.stdout.write('Created django_content_type')

                cursor.execute("""
                    CREATE TABLE auth_permission (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        content_type_id INTEGER NOT NULL REFERENCES django_content_type(id),
                        codename VARCHAR(100) NOT NULL,
                        CONSTRAINT auth_permission_content_type_id_codename_key UNIQUE (content_type_id, codename)
                    );
                """)
                self.stdout.write('Created auth_permission')

                cursor.execute("""
                    CREATE TABLE auth_group (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(150) NOT NULL UNIQUE
                    );
                """)
                self.stdout.write('Created auth_group')

                cursor.execute("""
                    CREATE TABLE auth_user (
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
                """)
                self.stdout.write('Created auth_user')

                cursor.execute("""
                    CREATE TABLE auth_group_permissions (
                        id SERIAL PRIMARY KEY,
                        group_id INTEGER NOT NULL REFERENCES auth_group(id),
                        permission_id INTEGER NOT NULL REFERENCES auth_permission(id),
                        CONSTRAINT auth_group_permissions_group_id_permission_id_key UNIQUE (group_id, permission_id)
                    );
                """)
                self.stdout.write('Created auth_group_permissions')

                cursor.execute("""
                    CREATE TABLE auth_user_groups (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES auth_user(id),
                        group_id INTEGER NOT NULL REFERENCES auth_group(id),
                        CONSTRAINT auth_user_groups_user_id_group_id_key UNIQUE (user_id, group_id)
                    );
                """)
                self.stdout.write('Created auth_user_groups')

                cursor.execute("""
                    CREATE TABLE auth_user_user_permissions (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES auth_user(id),
                        permission_id INTEGER NOT NULL REFERENCES auth_permission(id),
                        CONSTRAINT auth_user_user_permissions_user_id_permission_id_key UNIQUE (user_id, permission_id)
                    );
                """)
                self.stdout.write('Created auth_user_user_permissions')

                cursor.execute("""
                    CREATE TABLE django_admin_log (
                        id SERIAL PRIMARY KEY,
                        action_time TIMESTAMP WITH TIME ZONE NOT NULL,
                        object_id TEXT,
                        object_repr VARCHAR(200) NOT NULL,
                        action_flag SMALLINT NOT NULL CHECK (action_flag > 0),
                        change_message TEXT NOT NULL,
                        content_type_id INTEGER REFERENCES django_content_type(id),
                        user_id INTEGER NOT NULL REFERENCES auth_user(id)
                    );
                """)
                self.stdout.write('Created django_admin_log')

                cursor.execute("""
                    CREATE TABLE django_migrations (
                        id SERIAL PRIMARY KEY,
                        app VARCHAR(255) NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        applied TIMESTAMP WITH TIME ZONE NOT NULL
                    );
                """)
                self.stdout.write('Created django_migrations')

                cursor.execute("""
                    CREATE TABLE django_session (
                        session_key VARCHAR(40) PRIMARY KEY,
                        session_data TEXT NOT NULL,
                        expire_date TIMESTAMP WITH TIME ZONE NOT NULL
                    );
                """)
                self.stdout.write('Created django_session')

                cursor.execute("""
                    CREATE TABLE users_profile (
                        id SERIAL PRIMARY KEY,
                        avatar VARCHAR(100) NOT NULL,
                        user_id INTEGER NOT NULL UNIQUE REFERENCES auth_user(id)
                    );
                """)
                self.stdout.write('Created users_profile')

                cursor.execute("""
                    CREATE TABLE users_usersubscription (
                        id SERIAL PRIMARY KEY,
                        is_premium BOOLEAN NOT NULL,
                        subscription_expiry TIMESTAMP WITH TIME ZONE,
                        user_id INTEGER NOT NULL UNIQUE REFERENCES auth_user(id)
                    );
                """)
                self.stdout.write('Created users_usersubscription')

                cursor.execute("""
                    CREATE TABLE users_usermfasettings (
                        id SERIAL PRIMARY KEY,
                        mfa_enabled BOOLEAN NOT NULL,
                        user_id INTEGER NOT NULL UNIQUE REFERENCES auth_user(id)
                    );
                """)
                self.stdout.write('Created users_usermfasettings')

            # Run migrations with --fake flag since we created tables manually
            self.stdout.write('Running migrations with --fake flag...')
            call_command('migrate', '--fake')
            
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