from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.decorators import login_required
import json

@require_GET
def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'isAuthenticated': True,
            'username': request.user.username
        })
    return JsonResponse({'isAuthenticated': False})

@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

@require_POST
@csrf_exempt  # Temporarily disable CSRF for testing
def login_view(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not password:
            return JsonResponse({'success': False, 'message': 'Password is required'}, status=400)

        # Try to authenticate with username first, then email
        user = authenticate(username=username, password=password)
        if not user and email:
            # If email was provided and username auth failed, try to find user by email
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                user_obj = User.objects.get(email=email)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                user = None

        if user is not None:
            login(request, user)
            return JsonResponse({
                'success': True,
                'username': user.username,
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Invalid credentials'
            }, status=401)
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        }, status=500)

@login_required
def logout_view(request):
    logout(request)
    return JsonResponse({'success': True})
