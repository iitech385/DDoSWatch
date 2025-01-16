"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from users.views import (
    login_view, signup_view, logout_view, check_auth, 
    verify_email, verify_login, resend_verification,
    user_profile, toggle_mfa, check_subscription, create_subscription,
    create_checkout_session, subscription_success, subscription_cancel,
    paypal_webhook, check_payment_status, update_avatar
)
from users import views as user_views  # Adjust the import based on your structure
from django.conf import settings
from django.conf.urls.static import static

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', login_view, name='login'),
    path('api/csrf/', get_csrf_token, name='csrf'),
    path('api/signup/', signup_view, name='signup'),
    path('api/logout/', logout_view, name='logout'),
    path('api/check-auth/', check_auth, name='check-auth'),
    path('api/verify-email/', verify_email, name='verify-email'),
    path('api/verify-login/', verify_login, name='verify-login'),
    path('api/resend-verification/', resend_verification, name='resend-verification'),
    path('api/user-profile/', user_profile, name='user-profile'),
    path('api/toggle-mfa/', toggle_mfa, name='toggle-mfa'),
    path('api/change-username/', user_views.change_username, name='change_username'),
    path('api/check-subscription/', check_subscription, name='check-subscription'),
    path('api/create-subscription/', create_subscription, name='create-subscription'),
    path('api/create-checkout-session/', create_checkout_session, name='create-checkout'),
    path('subscription/success/', subscription_success, name='subscription-success'),
    path('subscription/cancel/', subscription_cancel, name='subscription-cancel'),
    path('api/paypal-webhook/', paypal_webhook, name='paypal-webhook'),
    path('api/check-payment/', check_payment_status, name='check-payment'),
    path('paypal/', include('paypal.standard.ipn.urls')),
    path('api/update-avatar/', update_avatar, name='update-avatar'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
