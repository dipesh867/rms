"""
Staff Dashboard URL Configuration
"""
from django.urls import path
from .views import (
    staff_dashboard_stats,
    staff_table_management,
    update_table_status
)

app_name = 'staff_dashboard'

urlpatterns = [
    # Staff Dashboard
    path('restaurant/<int:restaurant_id>/', staff_dashboard_stats, name='dashboard-stats'),
    path('restaurant/<int:restaurant_id>/tables/', staff_table_management, name='table-management'),
    path('restaurant/<int:restaurant_id>/tables/<int:table_id>/update-status/', update_table_status, name='update-table-status'),
]
