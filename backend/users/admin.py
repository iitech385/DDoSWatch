from django.contrib import admin
from .models import UserSubscription

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_premium', 'subscription_expiry')
    list_filter = ('is_premium',)
    search_fields = ('user__username', 'user__email')
    
    def save_model(self, request, obj, form, change):
        # Force is_premium to be updated
        if obj.is_premium and obj.subscription_expiry:
            obj.is_premium = True
        super().save_model(request, obj, form, change)