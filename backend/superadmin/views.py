import psutil
from django.db import connections
from django.db.utils import OperationalError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from .models import Restaurant, Employee
from .serializers import RestaurantSerializer


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
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Check if user is admin
        if not self.request.user.is_authenticated:
            raise PermissionDenied("Authentication required")

        # Check if user is admin using Employee model
        user_email = getattr(self.request.user, 'email', '')
        if not user_email:
            raise PermissionDenied("User email not found")

        try:
            employee = Employee.objects.get(email=user_email)
            if employee.role != 'admin':
                raise PermissionDenied("Only administrators can create restaurants")
        except Employee.DoesNotExist:
            raise PermissionDenied("User not found or not authorized")

        # Create the restaurant
        restaurant = serializer.save()

        return restaurant


# === AUTHENTICATION VIEWS ===

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Admin login endpoint - only for administrators"""
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists and is admin
        try:
            user = User.objects.get(email=email, role='admin')
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid admin credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check password
        if not user.check_password(password):
            return Response({
                'error': 'Invalid admin credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Update last login
        user.last_login = timezone.now()
        user.save()

        return Response({
            'message': 'Admin login successful',
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.pk,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'permissions': ['admin_dashboard', 'user_management', 'system_settings']
            }
        })

    except Exception as e:
        return Response({
            'error': f'Login failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def owner_login(request):
    """Owner login endpoint - only for restaurant owners"""
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists and is owner
        try:
            user = User.objects.get(email=email, role='owner')
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid owner credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check password
        if not user.check_password(password):
            return Response({
                'error': 'Invalid owner credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Update last login
        user.last_login = timezone.now()
        user.save()

        # Get restaurants owned by this user (assuming User model has restaurants relationship)
        # For now, return empty list - this needs to be implemented based on your User model
        restaurants = []

        return Response({
            'message': 'Owner login successful',
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.pk,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'restaurants': restaurants,
                'permissions': ['owner_dashboard', 'restaurant_management', 'staff_management']
            }
        })

    except Exception as e:
        return Response({
            'error': f'Login failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def staff_login(request):
    """Staff login endpoint - for all staff members (manager, kitchen, staff)"""
    try:
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists and is staff/manager/kitchen
        try:
            user = User.objects.get(
                email=email,
                role__in=['staff', 'manager', 'kitchen']
            )
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid staff credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check password
        if not user.check_password(password):
            return Response({
                'error': 'Invalid staff credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Update last login
        user.last_login = timezone.now()
        user.save()

        # Get restaurants for this staff member (empty for now)
        restaurants = []

        return Response({
            'message': 'Staff login successful',
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.pk,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'restaurants': restaurants,
                'permissions': [f'{user.role}_dashboard', 'restaurant_operations']
            }
        })

    except Exception as e:
        return Response({
            'error': f'Login failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def logout(request):
    """Logout endpoint"""
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'})
    except Exception as e:
        return Response({
            'error': f'Logout failed: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def verify_token(request):
    """Verify token and get user info"""
    try:
        user = request.user
        if not user.is_authenticated:
            return Response({
                'error': 'Token invalid or expired'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Get user info (user is already our custom User model)
        return Response({
            'valid': True,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'role': user.role,
                'restaurants': []  # Empty for now
            }
        })

    except Exception as e:
        return Response({
            'error': f'Token verification failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
