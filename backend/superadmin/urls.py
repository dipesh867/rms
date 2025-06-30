from django.urls import path
from .views import system_health_percent,RestaurantCreateView,count_restaurants,admin_stats,clear_health_cache

urlpatterns = [
    path('system-health/', system_health_percent,name='system_helth'),
    path('clear-health-cache/', clear_health_cache, name='clear_health_cache'),
    path('active-restaurants/', count_restaurants,name='count_restuarants'),
    path('admin-stats/', admin_stats, name='admin_stats'),
    path('restaurants/', RestaurantCreateView.as_view(), name='restaurant-create'),
]
