import os
from pathlib import Path
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'your-default-secret-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True  # Temporarily enable debug to see detailed errors

ALLOWED_HOSTS = ['*']  # Temporarily allow all hosts

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://d-do-s-watch.vercel.app',
    'https://d-do-s-watch-git-main-iitech385-gmailcoms-projects.vercel.app',
]
CORS_ALLOW_CREDENTIALS = True

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'https://d-do-s-watch.vercel.app',
    'https://d-do-s-watch-git-main-iitech385-gmailcoms-projects.vercel.app',
]
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SECURE = True
CSRF_USE_SESSIONS = False
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'Lax'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'users',  # Add the users app
    'api',
    'paypal.standard.ipn',  # Add PayPal IPN
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Move CORS middleware to top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database
if os.getenv('DATABASE_URL'):
    # Production database (PostgreSQL)
    DATABASES = {
        'default': dj_database_url.config(
            conn_max_age=600,
            conn_health_checks=True,
            ssl_require=True,
        )
    }
else:
    # Development database (SQLite)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Rest Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Temporarily allow any access
    ]
}

# Debug logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}

# Keep existing settings below this line
ROOT_URLCONF = 'ddoswatchglobal.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ddoswatchglobal.wsgi.application'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# Whitenoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField' 