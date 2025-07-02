"""
Owner Dashboard URL Configuration
"""
from django.urls import path
from .views import (
    owner_dashboard_stats,
    restaurant_analytics,
    create_expense
)

app_name = 'owner_dashboard'

urlpatterns = [
    # Owner Dashboard
    path('restaurant/<int:restaurant_id>/', owner_dashboard_stats, name='dashboard-stats'),
    path('restaurant/<int:restaurant_id>/analytics/', restaurant_analytics, name='analytics'),
    path('restaurant/<int:restaurant_id>/expenses/create/', create_expense, name='create-expense'),
]
