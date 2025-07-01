from django.urls import path, include
from .views import system_health_percent,RestaurantCreateView,count_restaurants,dashboard_stats
from .auth_views import admin_login, owner_login, staff_login, logout, verify_token

urlpatterns = [
    # === DASHBOARD & ADMIN APIS ===
    # New unified dashboard API (recommended)
    path('dashboard-stats/', dashboard_stats, name='dashboard_stats'),

    # Legacy endpoints (kept for backward compatibility)
    path('system-health/', system_health_percent,name='system_helth'),
    path('active-restaurants/', count_restaurants,name='count_restuarants'),

    # Restaurant management
    path('restaurants/', RestaurantCreateView.as_view(), name='restaurant-create'),

    # === COMPREHENSIVE API ENDPOINTS ===
    # Include all the new API endpoints
    path('api/', include('superadmin.api_urls')),

    # === ROLE-BASED DASHBOARD ENDPOINTS ===
    # Include role-specific dashboard APIs
    path('dashboard/', include('superadmin.role_urls')),

    # === AUTHENTICATION ENDPOINTS ===
    path('auth/admin/login/', admin_login, name='admin-login'),
    path('auth/owner/login/', owner_login, name='owner-login'),
    path('auth/staff/login/', staff_login, name='staff-login'),
    path('auth/logout/', logout, name='logout'),
    path('auth/verify/', verify_token, name='verify-token'),
]
