import psutil
from django.db import connections
from django.db.utils import OperationalError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from django.core.cache import cache
from .models import Restaurant
from .serializers import RestaurantSerializer
from rest_framework.permissions import IsAuthenticated
from superadmin.models import Employee,Restaurant


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

    # Add some randomness for testing (remove in production)
    import random
    score += random.randint(-5, 5)  # Add random variation for testing

    # Database connection check
    try:
        connections['default'].cursor()
    except OperationalError:
        score -= 30

    # Clamp score between 0 and 100
    score = max(0, min(score, 100))

    # Store previous health value for tracking changes
    previous_health = cache.get('previous_system_health', None)

    # Calculate change only if we have a previous value
    if previous_health is not None:
        change = score - previous_health
        change_str = f"{'+' if change > 0 else ''}{change}%" if change != 0 else "0%"
    else:
        # First time running, no previous value to compare
        change_str = "0%"
        previous_health = score  # Set for display purposes

    # Store current score as previous for next time
    cache.set('previous_system_health', score, timeout=3600)  # Store for 1 hour

    return Response({
        'system_health_percent': score,
        'previous_health': previous_health,
        'change': change_str
    })


@api_view(['POST'])
def clear_health_cache(request):
    """Clear the system health cache for testing"""
    cache.delete('previous_system_health')
    return Response({'message': 'Health cache cleared'})

 # Optional: if you want auth

@api_view(['GET'])
def count_restaurants(request):
    count = Restaurant.objects.all().count()
    return Response({'count': count})


@api_view(['GET'])
def admin_stats(request):
    """Get comprehensive admin statistics with percentage changes"""
    try:
        # Count restaurants
        total_restaurants = Restaurant.objects.all().count()

        # Count employees by role
        total_employees = Employee.objects.all().count()
        owners = Employee.objects.filter(role='owner').count()
        managers = Employee.objects.filter(role='manager').count()
        kitchen_staff = Employee.objects.filter(role='kitchen_staff').count()
        restaurant_staff = Employee.objects.filter(role='resturant_staff').count()

        # For now, we'll use employees as "users" since there's no separate user model
        total_users = total_employees
        active_users = total_employees  # Assuming all employees are active

        # Vendors - for now return 0 since there's no vendor model
        total_vendors = 0

        # Calculate simple percentage changes (mock data for now)
        # In a real application, you would store previous values in a separate table
        restaurant_change = "+8%" if total_restaurants > 0 else "0%"
        user_change = "+12%" if total_users > 0 else "0%"
        vendor_change = "+15%" if total_vendors > 0 else "0%"

        stats = {
            'total_restaurants': total_restaurants,
            'total_users': total_users,
            'active_users': active_users,
            'total_vendors': total_vendors,
            'changes': {
                'restaurants': restaurant_change,
                'users': user_change,
                'vendors': vendor_change
            },
            'employees_by_role': {
                'owners': owners,
                'managers': managers,
                'kitchen_staff': kitchen_staff,
                'restaurant_staff': restaurant_staff
            }
        }

        return Response(stats)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

class RestaurantCreateView(generics.CreateAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
