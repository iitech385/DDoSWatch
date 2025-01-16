from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
import random
from .models import UserVerification, UserLoginAttempt, UserSecuritySettings, UserMFASettings, UserSubscription, Profile
from django.db import transaction
from threading import Thread
from django.db.models import Q
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
import secrets
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
from datetime import timedelta
import logging
from django.middleware.csrf import get_token
import re
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import HttpResponse, FileResponse
from django.views.decorators.http import require_POST
from paypal.standard.ipn.signals import valid_ipn_received
from django.dispatch import receiver
import os
import time

# Set up logging
logger = logging.getLogger(__name__)

# Create your views here.

# Helper function for sending emails in background
def send_email_async(subject, message, from_email, recipient_list):
    def send():
        try:
            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email sending error: {str(e)}")
    
    Thread(target=send).start()

def validate_password_strength(password):
    """
    Validate that the password meets minimum requirements:
    - At least 8 characters long
    - Contains at least one uppercase letter
    - Contains at least one lowercase letter
    - Contains at least one digit
    - Contains at least one special character
    """
    if len(password) < 8:
        raise ValidationError('Password must be at least 8 characters long.')
    
    if not re.search(r'[A-Z]', password):
        raise ValidationError('Password must contain at least one uppercase letter.')
    
    if not re.search(r'[a-z]', password):
        raise ValidationError('Password must contain at least one lowercase letter.')
    
    if not re.search(r'\d', password):
        raise ValidationError('Password must contain at least one number.')
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValidationError('Password must contain at least one special character.')

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = request.data
        email_or_username = data.get('email', '').strip()
        password = data.get('password', '')

        print(f"Login attempt for: {email_or_username}")  # Debug log

        # Input validation
        if not email_or_username or not password:
            return Response({
                'message': 'Email/username and password are required',
                'success': False
            }, status=400)

        # Find user
        try:
            if '@' in email_or_username:
                user = User.objects.get(email=email_or_username)
            else:
                user = User.objects.get(username=email_or_username)
        except User.DoesNotExist:
            return Response({
                'message': 'Invalid credentials',
                'success': False
            }, status=400)

        # Check password
        if user.check_password(password):
            # Check if MFA is enabled for this user
            mfa_settings, _ = UserMFASettings.objects.get_or_create(user=user)
            
            print(f"MFA enabled: {mfa_settings.mfa_enabled}")  # Debug log
            
            if not mfa_settings.mfa_enabled:
                # If MFA is disabled, log in directly
                login(request, user)
                print(f"Direct login successful for user: {user.username}")  # Debug log
                return Response({
                    'message': 'Login successful',
                    'success': True,
                    'requiresVerification': False,
                    'username': user.username,
                    'email': user.email  # Add email to response
                })
            
            # If MFA is enabled, proceed with verification
            verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            # Save verification code
            UserVerification.objects.update_or_create(
                user=user,
                defaults={'verification_code': verification_code}
            )
            
            # Send email asynchronously
            send_email_async(
                'Login Verification Code - DDoS Watch Global',
                f'Your verification code is: {verification_code}',
                'iitech385@gmail.com',
                [user.email]
            )
            
            return Response({
                'message': 'Please verify your login',
                'success': True,
                'requiresVerification': True,
                'email': user.email
            })
        else:
            return Response({
                'message': 'Invalid credentials',
                'success': False
            }, status=400)

    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        return Response({
            'message': 'An error occurred during login',
            'success': False
        }, status=500)

class TempUserData:
    def __init__(self):
        self.users = {}

# Store temporary user data
temp_user_storage = TempUserData()

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    try:
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            return Response({
                'message': 'Username already exists',
                'success': False,
                'field': 'username'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'message': 'Email already registered',
                'success': False,
                'field': 'email'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate verification code
        verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Store user data temporarily
        temp_user_storage.users[email] = {
            'username': username,
            'password': password,
            'verification_code': verification_code
        }
        
        # Send verification email
        send_email_async(
            'Email Verification - DDoS Watch Global',
            f'Your verification code is: {verification_code}',
            'iitech385@gmail.com',
            [email]
        )

        return Response({
            'message': 'Please verify your email',
            'success': True,
            'requiresVerification': True,
            'email': email
        })

    except Exception as e:
        print(f"Signup error: {str(e)}")
        return Response({
            'message': 'An error occurred during signup',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def send_verification_email(email, code):
    try:
        send_mail(
            'Login Verification Code - DDoS Watch Global',
            f'Your login verification code is: {code}',
            'iitech385@gmail.com',
            [email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Email sending failed: {str(e)}")

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'success': True})

@api_view(['GET'])
def check_auth(request):
    try:
        if request.user.is_authenticated:
            return Response({
                'isAuthenticated': True,
                'username': request.user.username
            })
        return Response({'isAuthenticated': False})
    except Exception as e:
        print(f"Check auth error: {str(e)}")  # Debug logging
        return Response({
            'isAuthenticated': False,
            'error': str(e)
        }, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    try:
        email = request.data.get('email')
        code = request.data.get('code')
        
        # Get temporary user data
        user_data = temp_user_storage.users.get(email)
        
        if not user_data:
            return Response({
                'message': 'Verification expired or invalid',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)

        if user_data['verification_code'] != code:
            return Response({
                'message': 'Invalid verification code',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create the user
        try:
            user = User.objects.create_user(
                username=user_data['username'],
                email=email,
                password=user_data['password']
            )
            
            # Clean up temporary storage
            del temp_user_storage.users[email]
            
            # Log the user in
            login(request, user)
            
            return Response({
                'message': 'Email verified successfully',
                'success': True
            })
            
        except Exception as e:
            print(f"User creation error: {str(e)}")
            return Response({
                'message': 'Error creating user account',
                'success': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        print(f"Verification error: {str(e)}")
        return Response({
            'message': 'An error occurred during verification',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_login(request):
    try:
        email = request.data.get('email')
        code = request.data.get('code')
        
        try:
            user = User.objects.get(email=email)
            verification = UserVerification.objects.get(user=user)
            
            if verification.verification_code == code:
                # Log the user in
                login(request, user)
                
                # Delete the verification code after successful login
                verification.delete()
                
                return Response({
                    'message': 'Login successful',
                    'success': True,
                    'username': user.username
                })
            else:
                return Response({
                    'message': 'Invalid verification code',
                    'success': False
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except (User.DoesNotExist, UserVerification.DoesNotExist):
            return Response({
                'message': 'Invalid verification attempt',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f"Verification error: {str(e)}")
        return Response({
            'message': 'An error occurred during verification',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_verification(request):
    try:
        email = request.data.get('email')
        
        # Get temporary user data
        user_data = temp_user_storage.users.get(email)
        
        if not user_data:
            # Create new verification code if user exists in database
            try:
                user = User.objects.get(email=email)
                # Generate new verification code
                verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
                
                # Store in temporary storage
                temp_user_storage.users[email] = {
                    'username': user.username,
                    'verification_code': verification_code
                }
                
                # Send new verification email
                send_email_async(
                    'DDoS Watch Global - New Verification Code',
                    verification_code,
                    'iitech385@gmail.com',
                    [email]
                )

                return Response({
                    'message': 'New verification code sent',
                    'success': True
                })
            except User.DoesNotExist:
                return Response({
                    'message': 'Email not found',
                    'success': False
                }, status=status.HTTP_400_BAD_REQUEST)

        # Generate new verification code for existing temporary user
        verification_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        user_data['verification_code'] = verification_code
        
        # Send new verification email
        send_email_async(
            'DDoS Watch Global - New Verification Code',
            verification_code,
            'iitech385@gmail.com',
            [email]
        )

        return Response({
            'message': 'New verification code sent',
            'success': True
        })

    except Exception as e:
        print(f"Resend verification error: {str(e)}")
        return Response({
            'message': 'Failed to resend verification code',
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def request_password_reset(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        # Generate token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link
        reset_link = f"http://localhost:3000/reset-password/{uid}/{token}"
        
        # Send email
        send_mail(
            'Password Reset Request',
            f'Click the following link to reset your password: {reset_link}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        
        return Response({
            'success': True,
            'message': 'Password reset link has been sent to your email'
        })
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'No account found with this email'
        })

@api_view(['POST'])
def verify_reset_token(request):
    uid = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    try:
        # Decode the user ID
        user_id = urlsafe_base64_decode(uid).decode()
        user = User.objects.get(pk=user_id)
        
        # Verify token
        if default_token_generator.check_token(user, token):
            # Set new password
            user.set_password(new_password)
            user.save()
            return Response({
                'success': True,
                'message': 'Password has been reset successfully'
            })
        else:
            return Response({
                'success': False,
                'message': 'Invalid or expired reset link'
            })
    except (TypeError, ValueError, User.DoesNotExist):
        return Response({
            'success': False,
            'message': 'Invalid reset link'
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    mfa_settings, _ = UserMFASettings.objects.get_or_create(user=user)
    subscription, _ = UserSubscription.objects.get_or_create(user=user)
    profile, _ = Profile.objects.get_or_create(user=user)
    
    return Response({
        'username': user.username,
        'email': user.email,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
        'mfa_enabled': mfa_settings.mfa_enabled,
        'subscription_status': {
            'isSubscribed': subscription.is_premium,
            'plan': 'Premium' if subscription.is_premium else 'Free',
            'expiryDate': subscription.subscription_expiry
        },
        'avatar_url': request.build_absolute_uri(profile.avatar.url) if profile.avatar else None
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_mfa(request):
    try:
        enabled = request.data.get('enabled', False)
        mfa_settings, created = UserMFASettings.objects.get_or_create(
            user=request.user,
            defaults={'mfa_enabled': enabled}
        )
        
        if not created:
            mfa_settings.mfa_enabled = enabled
            mfa_settings.save()
        
        return Response({
            'status': 'success',
            'mfa_enabled': mfa_settings.mfa_enabled
        })
    except Exception as e:
        print(f"MFA toggle error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Failed to update MFA settings'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_username(request):
    new_username = request.data.get('new_username')
    user = request.user

    # Debug logging
    print(f"Received username change request: {new_username}")

    if not new_username:
        return Response({'error': 'New username is required'}, status=status.HTTP_400_BAD_REQUEST)

    # Simpler validation
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', new_username):
        return Response({
            'error': 'Username must be 3-20 characters and can only contain letters, numbers, and underscores'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Check if username is already taken (excluding current user)
    if User.objects.filter(username__iexact=new_username).exclude(id=user.id).exists():
        return Response({'error': 'Username is already taken'}, status=status.HTTP_400_BAD_REQUEST)

    # Allow same username with different case
    if new_username.lower() == user.username.lower():
        user.username = new_username
        user.save()
        return Response({'message': 'Username updated successfully'}, status=status.HTTP_200_OK)

    # Check 30-day restriction
    if user.last_username_change:
        days_since_change = (timezone.now() - user.last_username_change).days
        if days_since_change < 30:
            days_remaining = 30 - days_since_change
            return Response(
                {'error': f'You can change your username in {days_remaining} days'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    # Update username
    user.username = new_username
    user.last_username_change = timezone.now()
    user.save()

    return Response({'message': 'Username updated successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_subscription(request):
    try:
        subscription = UserSubscription.objects.get(user=request.user)
        print(f"Subscription check for {request.user.username}: is_premium={subscription.is_premium}")  # Debug log
        return Response({
            'isSubscribed': subscription.is_premium,
            'expiryDate': subscription.subscription_expiry
        })
    except UserSubscription.DoesNotExist:
        print(f"No subscription found for {request.user.username}")  # Debug log
        return Response({
            'isSubscribed': False,
            'expiryDate': None
        })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_subscription(request):
    subscription, created = UserSubscription.objects.get_or_create(
        user=request.user
    )
    
    # Set subscription for 30 days from now
    subscription.is_premium = True
    subscription.subscription_expiry = timezone.now() + timezone.timedelta(days=30)
    subscription.save()
    
    return Response({
        'message': 'Subscription created successfully',
        'expiryDate': subscription.subscription_expiry
    })

@api_view(['POST'])
@csrf_exempt
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    try:
        # Use your direct PayPal payment link
        checkout_url = "https://www.paypal.com/ncp/payment/EXT8Q7LLRAY78"
        
        return Response({
            'url': checkout_url,
            'success': True
        })
    except Exception as e:
        print(f"Checkout error: {str(e)}")
        return Response({
            'error': str(e),
            'success': False
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscription_success(request):
    try:
        # When user returns from PayPal, mark them as subscribed
        subscription, created = UserSubscription.objects.get_or_create(
            user=request.user,
            defaults={
                'is_premium': True,
                'subscription_expiry': timezone.now() + timezone.timedelta(days=30)
            }
        )
        
        if not created:
            subscription.is_premium = True
            subscription.subscription_expiry = timezone.now() + timezone.timedelta(days=30)
            subscription.save()
        
        # Redirect to the frontend
        return redirect('http://localhost:3000/profile')
        
    except Exception as e:
        print(f"Error in subscription_success: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def subscription_cancel(request):
    return Response({
        'message': 'Subscription cancelled'
    })

@csrf_exempt
@require_POST
def paypal_webhook(request):
    """Handle PayPal IPN (Instant Payment Notification)"""
    try:
        # Verify the payment with PayPal
        if request.POST.get('payment_status') == 'Completed':
            # Get the custom parameter (user ID) from PayPal
            user_id = request.POST.get('custom')
            
            # Update user's subscription
            subscription = UserSubscription.objects.get_or_create(
                user_id=user_id,
                defaults={
                    'is_premium': True,
                    'subscription_expiry': timezone.now() + timezone.timedelta(days=30)
                }
            )[0]
            
            subscription.is_premium = True
            subscription.subscription_expiry = timezone.now() + timezone.timedelta(days=30)
            subscription.save()
            
            print(f"Subscription activated for user {user_id}")
            
        return HttpResponse('OK')
    except Exception as e:
        print(f"PayPal webhook error: {str(e)}")
        return HttpResponse(status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_subscription_status(request):
    """Check if user has active subscription"""
    try:
        subscription = UserSubscription.objects.get(user=request.user)
        return Response({
            'isSubscribed': subscription.is_premium and subscription.subscription_expiry > timezone.now(),
            'expiryDate': subscription.subscription_expiry
        })
    except UserSubscription.DoesNotExist:
        return Response({
            'isSubscribed': False,
            'expiryDate': None
        })

@receiver(valid_ipn_received)
def payment_notification(sender, **kwargs):
    ipn_obj = sender
    if ipn_obj.payment_status == "Completed":
        # Payment was successful
        try:
            # Update user subscription
            subscription, created = UserSubscription.objects.get_or_create(
                user_id=ipn_obj.custom,  # This will be the user ID we passed
                defaults={
                    'is_premium': True,
                    'subscription_expiry': timezone.now() + timezone.timedelta(days=30)
                }
            )
            
            if not created:
                subscription.is_premium = True
                subscription.subscription_expiry = timezone.now() + timezone.timedelta(days=30)
                subscription.save()
                
        except Exception as e:
            print(f"Error processing payment: {str(e)}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_status(request):
    try:
        subscription = UserSubscription.objects.get(user=request.user)
        return Response({
            'isSubscribed': subscription.is_premium,
            'expiryDate': subscription.subscription_expiry
        })
    except UserSubscription.DoesNotExist:
        return Response({
            'isSubscribed': False,
            'expiryDate': None
        })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_premium(request):
    try:
        # Check if user is premium
        subscription = UserSubscription.objects.get(user=request.user)
        if not subscription.is_premium:
            return Response({'error': 'Premium subscription required'}, status=403)
            
        # Path to your premium file
        file_path = os.path.join(settings.BASE_DIR, 'downloads', 'premium', 'ddos-watch-premium.zip')
        
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = 'attachment; filename="ddos-watch-premium.zip"'
            return response
        else:
            return Response({'error': 'File not found'}, status=404)
            
    except UserSubscription.DoesNotExist:
        return Response({'error': 'Subscription not found'}, status=403)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def download_free(request):
    try:
        file_path = os.path.join(settings.BASE_DIR, 'downloads', 'free', 'ddos-watch-free.zip')
        
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = 'attachment; filename="ddos-watch-free.zip"'
            return response
        else:
            return Response({'error': 'File not found'}, status=404)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def update_avatar(request):
    try:
        print("Update avatar request received")
        print("User:", request.user)
        print("Is authenticated:", request.user.is_authenticated)
        print("Headers:", request.headers)
        print("Files:", request.FILES)

        if 'avatar' not in request.FILES:
            return Response({'error': 'No avatar file provided'}, status=400)

        # Get or create profile for the current user
        profile, created = Profile.objects.get_or_create(user=request.user)
        print(f"Profile {'created' if created else 'found'} for user")
        
        # Get the uploaded file
        file = request.FILES['avatar']
        print("File received:", file.name)
        
        # Force a new filename with user ID to ensure uniqueness
        ext = os.path.splitext(file.name)[1]
        unique_filename = f'avatar_{request.user.id}_{int(time.time())}{ext}'
        file.name = unique_filename
        print("New filename:", unique_filename)
        
        # Delete old avatar if it exists
        if profile.avatar:
            try:
                old_path = profile.avatar.path
                if os.path.exists(old_path):
                    os.remove(old_path)
                    print("Old avatar deleted")
            except Exception as e:
                print("Error deleting old avatar:", str(e))
        
        # Save the new avatar
        profile.avatar = file
        profile.save()
        print("New avatar saved")

        # Force refresh from database
        profile.refresh_from_db()
        
        # Get the full URL
        avatar_url = request.build_absolute_uri(profile.avatar.url)
        print("Avatar URL:", avatar_url)

        # Return the new avatar URL
        return Response({
            'message': 'Avatar updated successfully',
            'avatar_url': avatar_url
        })
    except Exception as e:
        print(f"Avatar update error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return Response({'error': str(e)}, status=500)
