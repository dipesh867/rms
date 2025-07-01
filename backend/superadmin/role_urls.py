"""
Role-based URL patterns for different user dashboards
"""
from django.urls import path
from .role_based_views import (
    # Admin Dashboard
    admin_dashboard_stats,

    # Owner Dashboard
    owner_dashboard_stats,

    # Manager Dashboard
    manager_dashboard_stats,

    # Kitchen Staff Dashboard
    kitchen_dashboard_stats,
    update_kitchen_item_status,

    # Vendor Management
    vendor_dashboard_stats,
    restaurant_vendor_management
)

from .staff_apis import (
    # Staff Management
    staff_dashboard_stats,
    staff_schedule,
    real_time_restaurant_status,
    create_notification,
    get_user_notifications
)

urlpatterns = [
    # === ADMINISTRATOR DASHBOARD ===
    path('admin/dashboard/', admin_dashboard_stats, name='admin-dashboard'),
    
    # === RESTAURANT OWNER DASHBOARD ===
    path('owner/restaurant/<int:restaurant_id>/dashboard/', owner_dashboard_stats, name='owner-dashboard'),
    
    # === RESTAURANT MANAGER DASHBOARD ===
    path('manager/restaurant/<int:restaurant_id>/dashboard/', manager_dashboard_stats, name='manager-dashboard'),
    
    # === KITCHEN STAFF DASHBOARD ===
    path('kitchen/restaurant/<int:restaurant_id>/dashboard/', kitchen_dashboard_stats, name='kitchen-dashboard'),
    path('kitchen/item/<int:item_id>/update-status/', update_kitchen_item_status, name='update-kitchen-item-status'),
    
    # === VENDOR MANAGEMENT ===
    path('vendor/<int:vendor_id>/dashboard/', vendor_dashboard_stats, name='vendor-dashboard'),
    path('restaurant/<int:restaurant_id>/vendors/', restaurant_vendor_management, name='restaurant-vendors'),

    # === STAFF MANAGEMENT ===
    path('staff/restaurant/<int:restaurant_id>/dashboard/', staff_dashboard_stats, name='staff-dashboard'),
    path('staff/restaurant/<int:restaurant_id>/schedule/', staff_schedule, name='staff-schedule'),

    # === REAL-TIME UPDATES ===
    path('realtime/restaurant/<int:restaurant_id>/', real_time_restaurant_status, name='realtime-status'),

    # === NOTIFICATIONS ===
    path('notifications/restaurant/<int:restaurant_id>/create/', create_notification, name='create-notification'),
    path('notifications/user/', get_user_notifications, name='user-notifications'),
]
