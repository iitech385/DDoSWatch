FROM python:3.9

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy project files
COPY . .

# Create necessary directories
RUN mkdir -p staticfiles

# Run migrations and collect static files
CMD python manage.py migrate --noinput && \
    python manage.py collectstatic --noinput && \
    gunicorn ddoswatchglobal.wsgi --bind 0.0.0.0:$PORT 