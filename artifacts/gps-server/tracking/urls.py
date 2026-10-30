"""URL patterns for CIVAC GPS Tracking API."""
from django.urls import path
from . import views

urlpatterns = [
    # Device CRUD
    path('devices/',              views.DeviceListCreateView.as_view(),  name='device-list'),
    path('devices/<int:pk>/',     views.DeviceDetailView.as_view(),      name='device-detail'),
    path('devices/<int:pk>/position/', views.DevicePositionView.as_view(), name='device-position'),
    path('devices/<int:pk>/history/',  views.DeviceHistoryView.as_view(),  name='device-history'),

    # Geofences
    path('geofences/',            views.GeoFenceListCreateView.as_view(), name='geofence-list'),

    # Alerts
    path('alerts/',               views.GPSAlertListView.as_view(),      name='alert-list'),
    path('alerts/<int:pk>/',      views.GPSAlertListView.as_view(),      name='alert-detail'),

    # Stats & plans
    path('stats/',                views.GPSStatsView.as_view(),          name='gps-stats'),
    path('plans/',                views.GPSPlanInfoView.as_view(),       name='gps-plans'),
    path('health/',               views.GPSHealthView.as_view(),         name='gps-health'),
]
