from django.urls import path
from users import views
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

urlpatterns = [
    path('csrf/', get_csrf_token, name='csrf'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('check-auth/', views.check_auth, name='check-auth'),
    path('verify-email/', views.verify_email, name='verify-email'),
    path('verify-login/', views.verify_login, name='verify-login'),
    path('resend-verification/', views.resend_verification, name='resend-verification'),
    path('request-password-reset/', views.request_password_reset, name='request-password-reset'),
    path('verify-reset-token/', views.verify_reset_token, name='verify-reset-token'),
    path('user-profile/', views.user_profile, name='user-profile'),
    path('toggle-mfa/', views.toggle_mfa, name='toggle-mfa'),
    path('change-username/', views.change_username, name='change-username'),
    path('check-subscription/', views.check_subscription, name='check-subscription'),
    path('create-subscription/', views.create_subscription, name='create-subscription'),
    path('create-checkout-session/', views.create_checkout_session, name='create-checkout-session'),
    path('subscription-success/', views.subscription_success, name='subscription-success'),
    path('subscription-cancel/', views.subscription_cancel, name='subscription-cancel'),
    path('paypal-webhook/', views.paypal_webhook, name='paypal-webhook'),
    path('check-subscription-status/', views.check_subscription_status, name='check-subscription-status'),
    path('check-payment-status/', views.check_payment_status, name='check-payment-status'),
    path('download-premium/', views.download_premium, name='download-premium'),
    path('download-free/', views.download_free, name='download-free'),
    path('update-avatar/', views.update_avatar, name='update-avatar'),
] 