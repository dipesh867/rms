import psutil
from django.db import connections
from django.db.utils import OperationalError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from .models import Restaurant
from .serializers import RestaurantSerializer
from rest_framework.permissions import IsAuthenticated 


@api_view(['GET'])
def system_health_percent(request):
    score = 100

    # CPU usage check
    cpu_usage = psutil.cpu_percent(interval=0.5)
    if cpu_usage > 80:
        score -= 10

    # Memory usage check
    memory_usage = psutil.virtual_memory().percent
    if memory_usage > 80:
        score -= 10

    # Disk usage check
    disk_usage = psutil.disk_usage('/').percent
    if disk_usage > 90:
        score -= 10

    # Database connection check
    try:
        connections['default'].cursor()
    except OperationalError:
        score -= 30

    # Clamp score between 0 and 100
    score = max(0, min(score, 100))
    

    return Response({'system_health_percent': score})

 # Optional: if you want auth

class RestaurantCreateView(generics.CreateAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
