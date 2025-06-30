from django.urls import path
from .views import system_health_percent,test_api

urlpatterns = [
    path('api/system-health/', system_health_percent,name='system_helth'),
    path('api/test/',test_api,name='test_api')
]
