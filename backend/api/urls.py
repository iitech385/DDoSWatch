from django.urls import path
from . import views

urlpatterns = [
    path('check-auth/', views.check_auth, name='check-auth'),
    path('csrf/', views.get_csrf_token, name='csrf'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
] 