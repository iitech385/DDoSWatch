from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from datetime import timedelta
import os
from django.db.models.signals import pre_save
from django.dispatch import receiver
import time

class UserVerification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    verification_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class UserLoginAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    was_successful = models.BooleanField(default=False)

class UserSecuritySettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    account_locked = models.BooleanField(default=False)
    lock_timestamp = models.DateTimeField(null=True, blank=True)
    failed_attempts = models.IntegerField(default=0)
    
    def increment_failed_attempts(self):
        self.failed_attempts += 1
        if self.failed_attempts >= 5:  # Lock after 5 failed attempts
            self.account_locked = True
            self.lock_timestamp = timezone.now()
        self.save()
    
    def reset_failed_attempts(self):
        self.failed_attempts = 0
        self.account_locked = False
        self.lock_timestamp = None
        self.save()

class UserMFASettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    mfa_enabled = models.BooleanField(default=False)

    class Meta:
        verbose_name = "User MFA Setting"
        verbose_name_plural = "User MFA Settings"

class VerificationCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    verification_type = models.CharField(max_length=10)  # 'login' or 'signup'
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['email', 'verification_type']),
        ]

    @property
    def is_expired(self):
        return self.created_at < timezone.now() - timedelta(minutes=5)

class UserSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_premium = models.BooleanField(default=False)
    subscription_expiry = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "User Subscription"
        verbose_name_plural = "User Subscriptions"

def user_avatar_path(instance, filename):
    # Get the file extension
    ext = os.path.splitext(filename)[1]
    # Create a timestamp
    timestamp = int(time.time())
    # Create unique filename using user ID and timestamp
    return f'avatars/user_{instance.user.id}/{timestamp}{ext}'

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to=user_avatar_path, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old_profile = Profile.objects.get(pk=self.pk)
                if old_profile.avatar and self.avatar and old_profile.avatar != self.avatar:
                    # Get the file path
                    file_path = old_profile.avatar.path
                    if os.path.exists(file_path):
                        os.remove(file_path)
            except (Profile.DoesNotExist, ValueError):
                pass
        super().save(*args, **kwargs)
