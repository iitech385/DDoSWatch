from django.middleware.security import SecurityMiddleware
from django.core.cache import cache
from django.http import HttpResponseTooManyRequests
import time
import logging

class SecurityHeaders:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response['Content-Security-Policy'] = "default-src 'self'"
        
        return response 

class EnhancedRateLimitMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limits = {
            'default': {'limit': 100, 'window': 3600},  # 100 requests per hour
            'login': {'limit': 5, 'window': 300},       # 5 login attempts per 5 minutes
            'signup': {'limit': 3, 'window': 3600},     # 3 signups per hour
        }

    def __call__(self, request):
        ip = request.META.get('REMOTE_ADDR')
        path = request.path.lower()
        
        # Determine rate limit based on path
        if 'login' in path:
            limit_key = 'login'
        elif 'signup' in path:
            limit_key = 'signup'
        else:
            limit_key = 'default'
            
        rate_limit = self.rate_limits[limit_key]
        
        # Check rate limit
        cache_key = f'rate_limit_{limit_key}_{ip}'
        requests = cache.get(cache_key, [])
        now = time.time()
        
        # Remove old requests
        requests = [req for req in requests if req > now - rate_limit['window']]
        
        if len(requests) >= rate_limit['limit']:
            logger.warning(f"Rate limit exceeded for IP {ip} on {limit_key}")
            return HttpResponseTooManyRequests("Too many requests. Please try again later.")
            
        requests.append(now)
        cache.set(cache_key, requests, rate_limit['window'])
        
        return self.get_response(request) 