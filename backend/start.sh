#!/bin/bash

# Set default port if not provided
PORT="${PORT:-8000}"

# Run migrations
python manage.py migrate --noinput

# Collect static files
python manage.py collectstatic --noinput

# Start Gunicorn
gunicorn ddoswatchglobal.wsgi --bind "0.0.0.0:$PORT" 