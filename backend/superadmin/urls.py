from django.urls import path
from .views import system_health_percent,RestaurantCreateView

urlpatterns = [
    path('system-health/', system_health_percent,name='system_helth'),
    path('restaurants/', RestaurantCreateView.as_view(), name='restaurant-create'),
]
