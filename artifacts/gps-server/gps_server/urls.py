"""CIVAC GPS Server URL configuration."""
from django.urls import path, include

urlpatterns = [
    path('api/gps/', include('tracking.urls')),
]
