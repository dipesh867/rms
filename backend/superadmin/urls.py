from django.urls import path
from .views import (
    system_health_percent, RestaurantCreateView, count_restaurants, dashboard_stats,
    admin_login, owner_login, staff_login, logout, verify_token
)

app_name = 'superadmin'

urlpatterns = [
    # === ADMIN DASHBOARD & APIS ===
    path('dashboard-stats/', dashboard_stats, name='dashboard_stats'),

    # Legacy endpoints (kept for backward compatibility)
    path('system-health/', system_health_percent, name='system_health'),
    path('active-restaurants/', count_restaurants, name='count_restaurants'),

    # Restaurant management
    path('restaurants/', RestaurantCreateView.as_view(), name='restaurant-create'),

    # === AUTHENTICATION ENDPOINTS ===
    path('auth/admin/login/', admin_login, name='admin-login'),
    path('auth/owner/login/', owner_login, name='owner-login'),
    path('auth/staff/login/', staff_login, name='staff-login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/verify/', verify_token, name='verify-token'),
]
