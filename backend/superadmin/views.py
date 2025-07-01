import psutil
from django.db import connections
from django.db.utils import OperationalError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from django.core.cache import cache
from .models import Restaurant
from .serializers import RestaurantSerializer
# from rest_framework.permissions import IsAuthenticated  # Uncomment if needed
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

    # Note: In production, remove any artificial variations

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




 # Optional: if you want auth

@api_view(['GET'])
def count_restaurants(request):
    count = Restaurant.objects.all().count()
    return Response({'count': count})


def calculate_percentage_change(current, previous):
    """Calculate percentage change between current and previous values"""
    if previous is None or previous == 0:
        return "0%"

    change = ((current - previous) / previous) * 100
    if change == 0:
        return "0%"
    elif change > 0:
        return f"+{change:.1f}%"
    else:
        return f"{change:.1f}%"


def get_weekly_stats():
    """Get statistics from 1 week ago for comparison using created_at dates"""
    from datetime import timedelta
    from django.utils import timezone
    from superadmin.models import DailyStats

    # Calculate date 1 week ago
    one_week_ago = timezone.now() - timedelta(days=7)
    one_week_ago_date = one_week_ago.date()

    # Try to get stored daily stats from 1 week ago
    try:
        daily_stats = DailyStats.objects.get(date=one_week_ago_date)
        return {
            'restaurants': daily_stats.restaurant_count,
            'employees': daily_stats.employee_count,
            'vendors': daily_stats.vendor_count,
            'date': daily_stats.date.isoformat()
        }
    except DailyStats.DoesNotExist:
        # If no stored stats, calculate based on created_at dates
        restaurants_week_ago = Restaurant.objects.filter(created_at__lte=one_week_ago).count()
        employees_week_ago = Employee.objects.filter(created_at__lte=one_week_ago).count()

        return {
            'restaurants': restaurants_week_ago,
            'employees': employees_week_ago,
            'vendors': 0,  # No vendors yet
            'date': one_week_ago_date.isoformat()
        }


def store_daily_stats():
    """Store current statistics for future weekly comparisons"""
    from datetime import date
    from superadmin.models import DailyStats

    today = date.today()
    current_restaurants = Restaurant.objects.count()
    current_employees = Employee.objects.count()

    # Update or create today's stats
    daily_stats, created = DailyStats.objects.update_or_create(
        date=today,
        defaults={
            'restaurant_count': current_restaurants,
            'employee_count': current_employees,
            'vendor_count': 0,  # No vendors yet
            'system_health_avg': 90.0  # Default health score
        }
    )

    return daily_stats


@api_view(['GET'])
def dashboard_stats(request):
    """
    Unified API for all dashboard statistics including:
    - System Health with percentage changes
    - Restaurant counts with percentage changes
    - User/Employee counts with percentage changes
    - Vendor counts with percentage changes
    """
    try:
        # === SYSTEM HEALTH CALCULATION ===
        health_score = 100

        # CPU usage check
        cpu_usage = psutil.cpu_percent(interval=0.5)
        if cpu_usage > 80:
            health_score -= 10

        # Memory usage check
        memory_usage = psutil.virtual_memory().percent
        if memory_usage > 80:
            health_score -= 10

        # Disk usage check
        disk_usage = psutil.disk_usage('/').percent
        if disk_usage > 90:
            health_score -= 10

        # Database connection check
        try:
            connections['default'].cursor()
        except OperationalError:
            health_score -= 30

        # Clamp score between 0 and 100
        health_score = max(0, min(health_score, 100))

        # Track system health changes
        previous_health = cache.get('previous_system_health', None)
        if previous_health is not None:
            health_change = health_score - previous_health
            health_change_str = f"{'+' if health_change > 0 else ''}{health_change}%" if health_change != 0 else "0%"
        else:
            health_change_str = "0%"
        cache.set('previous_system_health', health_score, timeout=3600)

        # === STORE TODAY'S STATS FOR FUTURE COMPARISONS ===
        store_daily_stats()

        # === GET WEEKLY COMPARISON DATA ===
        weekly_stats = get_weekly_stats()

        # === RESTAURANT STATISTICS ===
        current_restaurants = Restaurant.objects.all().count()
        restaurants_week_ago = weekly_stats['restaurants']
        restaurant_change = calculate_percentage_change(current_restaurants, restaurants_week_ago)

        # === USER/EMPLOYEE STATISTICS ===
        current_users = Employee.objects.all().count()
        users_week_ago = weekly_stats['employees']
        user_change = calculate_percentage_change(current_users, users_week_ago)

        # Active users (assuming all employees are active for now)
        active_users = current_users

        # Employee breakdown by role
        owners = Employee.objects.filter(role='owner').count()
        managers = Employee.objects.filter(role='manager').count()
        kitchen_staff = Employee.objects.filter(role='kitchen_staff').count()
        restaurant_staff = Employee.objects.filter(role='resturant_staff').count()

        # === VENDOR STATISTICS ===
        # For now, vendors = 0 since there's no vendor model
        current_vendors = 0
        vendors_week_ago = weekly_stats['vendors']
        vendor_change = calculate_percentage_change(current_vendors, vendors_week_ago)

        # === RESPONSE DATA ===
        dashboard_data = {
            'system_health': {
                'current': health_score,
                'previous': previous_health,
                'change': health_change_str,
                'details': {
                    'cpu_usage': cpu_usage,
                    'memory_usage': memory_usage,
                    'disk_usage': disk_usage
                }
            },
            'restaurants': {
                'total': current_restaurants,
                'week_ago': restaurants_week_ago,
                'change': restaurant_change,
                'comparison_period': '1 week'
            },
            'users': {
                'total': current_users,
                'active': active_users,
                'week_ago': users_week_ago,
                'change': user_change,
                'comparison_period': '1 week',
                'breakdown': {
                    'owners': owners,
                    'managers': managers,
                    'kitchen_staff': kitchen_staff,
                    'restaurant_staff': restaurant_staff
                }
            },
            'vendors': {
                'total': current_vendors,
                'week_ago': vendors_week_ago,
                'change': vendor_change,
                'comparison_period': '1 week'
            },
            'last_updated': cache.get('last_dashboard_update', 'Never')
        }

        # Update last updated timestamp
        from datetime import datetime
        cache.set('last_dashboard_update', datetime.now().isoformat(), timeout=3600)

        return Response(dashboard_data)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

class RestaurantCreateView(generics.CreateAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
