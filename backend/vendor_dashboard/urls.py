"""
Vendor Dashboard URL Configuration
"""
from django.urls import path
from .views import vendor_dashboard_stats

app_name = 'vendor_dashboard'

urlpatterns = [
    # Vendor Dashboard
    path('<int:vendor_id>/', vendor_dashboard_stats, name='dashboard-stats'),
]
