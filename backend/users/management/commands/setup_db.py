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

                    CREATE TABLE IF NOT EXISTS auth_permission (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        content_type_id INTEGER NOT NULL REFERENCES django_content_type(id),
                        codename VARCHAR(100) NOT NULL,
                        CONSTRAINT auth_permission_content_type_id_codename_key UNIQUE (content_type_id, codename)
                    );

                    CREATE TABLE IF NOT EXISTS auth_group (
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(150) NOT NULL UNIQUE
                    );

                    CREATE TABLE IF NOT EXISTS auth_group_permissions (
                        id SERIAL PRIMARY KEY,
                        group_id INTEGER NOT NULL REFERENCES auth_group(id),
                        permission_id INTEGER NOT NULL REFERENCES auth_permission(id),
                        CONSTRAINT auth_group_permissions_group_id_permission_id_key UNIQUE (group_id, permission_id)
                    );

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

                    CREATE TABLE IF NOT EXISTS auth_user_groups (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES auth_user(id),
                        group_id INTEGER NOT NULL REFERENCES auth_group(id),
                        CONSTRAINT auth_user_groups_user_id_group_id_key UNIQUE (user_id, group_id)
                    );

                    CREATE TABLE IF NOT EXISTS auth_user_user_permissions (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES auth_user(id),
                        permission_id INTEGER NOT NULL REFERENCES auth_permission(id),
                        CONSTRAINT auth_user_user_permissions_user_id_permission_id_key UNIQUE (user_id, permission_id)
                    );

                    CREATE TABLE IF NOT EXISTS django_admin_log (
                        id SERIAL PRIMARY KEY,
                        action_time TIMESTAMP WITH TIME ZONE NOT NULL,
                        object_id TEXT,
                        object_repr VARCHAR(200) NOT NULL,
                        action_flag SMALLINT NOT NULL CHECK (action_flag > 0),
                        change_message TEXT NOT NULL,
                        content_type_id INTEGER REFERENCES django_content_type(id),
                        user_id INTEGER NOT NULL REFERENCES auth_user(id)
                    );

                    CREATE TABLE IF NOT EXISTS django_session (
                        session_key VARCHAR(40) PRIMARY KEY,
                        session_data TEXT NOT NULL,
                        expire_date TIMESTAMP WITH TIME ZONE NOT NULL
                    );

                    CREATE TABLE IF NOT EXISTS users_profile (
                        id SERIAL PRIMARY KEY,
                        avatar VARCHAR(100) NOT NULL,
                        user_id INTEGER NOT NULL UNIQUE REFERENCES auth_user(id)
                    );

                    CREATE TABLE IF NOT EXISTS users_usersubscription (
                        id SERIAL PRIMARY KEY,
                        is_premium BOOLEAN NOT NULL,
                        subscription_expiry TIMESTAMP WITH TIME ZONE,
                        user_id INTEGER NOT NULL UNIQUE REFERENCES auth_user(id)
                    );

                    CREATE TABLE IF NOT EXISTS users_usermfasettings (
                        id SERIAL PRIMARY KEY,
                        mfa_enabled BOOLEAN NOT NULL,
                        user_id INTEGER NOT NULL UNIQUE REFERENCES auth_user(id)
                    );
                """)

            # Run migrations
            self.stdout.write('Running migrations...')
            call_command('migrate', '--fake')
            
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