"""
Kitchen Dashboard URL Configuration
"""
from django.urls import path
from .views import kitchen_dashboard_stats

app_name = 'kitchen_dashboard'

urlpatterns = [
    # Kitchen Dashboard - start with basic endpoint
    path('restaurant/<int:restaurant_id>/', kitchen_dashboard_stats, name='dashboard-stats'),
]
