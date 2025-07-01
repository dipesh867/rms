"""
Authentication views with role-based access control
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from .models import Employee, Restaurant, Staff
from .serializers import EmployeeSerializer

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
        
        # Check if employee exists and is admin
        try:
            employee = Employee.objects.get(email=email, role='admin')
        except Employee.DoesNotExist:
            return Response({
                'error': 'Invalid admin credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Create or get Django user
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': employee.name.split()[0] if employee.name else '',
                'last_name': ' '.join(employee.name.split()[1:]) if len(employee.name.split()) > 1 else ''
            }
        )
        
        if created or not user.check_password(password):
            user.set_password(password)
            user.save()
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        if not user:
            return Response({
                'error': 'Authentication failed'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Update last login
        employee.updated_at = timezone.now()
        employee.save()
        
        return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': employee.id,
                'name': employee.name,
                'email': employee.email,
                'role': employee.role,
                'phone': employee.phone,
                'restaurants': [r.id for r in employee.restaurants.all()],
                'is_admin': True
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
        
        # Check if employee exists and is owner
        try:
            employee = Employee.objects.get(email=email, role='owner')
        except Employee.DoesNotExist:
            return Response({
                'error': 'Invalid owner credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Create or get Django user
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': employee.name.split()[0] if employee.name else '',
                'last_name': ' '.join(employee.name.split()[1:]) if len(employee.name.split()) > 1 else ''
            }
        )
        
        if created or not user.check_password(password):
            user.set_password(password)
            user.save()
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        if not user:
            return Response({
                'error': 'Authentication failed'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Get restaurant info
        restaurants = employee.restaurants.all()
        restaurant_data = []
        for restaurant in restaurants:
            restaurant_data.append({
                'id': restaurant.id,
                'name': restaurant.name,
                'email': restaurant.email,
                'address': restaurant.address,
                'phone': restaurant.phone
            })
        
        # Update last login
        employee.updated_at = timezone.now()
        employee.save()
        
        return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': employee.id,
                'name': employee.name,
                'email': employee.email,
                'role': employee.role,
                'phone': employee.phone,
                'restaurants': restaurant_data,
                'restaurant_id': restaurants.first().id if restaurants.exists() else None,
                'is_owner': True
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
        
        # Check if employee exists and is staff (not admin or owner)
        try:
            employee = Employee.objects.get(
                email=email, 
                role__in=['manager', 'kitchen', 'staff', 'waiter']
            )
        except Employee.DoesNotExist:
            return Response({
                'error': 'Invalid staff credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Create or get Django user
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'first_name': employee.name.split()[0] if employee.name else '',
                'last_name': ' '.join(employee.name.split()[1:]) if len(employee.name.split()) > 1 else ''
            }
        )
        
        if created or not user.check_password(password):
            user.set_password(password)
            user.save()
        
        # Authenticate user
        user = authenticate(username=email, password=password)
        if not user:
            return Response({
                'error': 'Authentication failed'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Get restaurant and staff profile info
        restaurants = employee.restaurants.all()
        restaurant_data = []
        for restaurant in restaurants:
            restaurant_data.append({
                'id': restaurant.id,
                'name': restaurant.name,
                'email': restaurant.email,
                'address': restaurant.address,
                'phone': restaurant.phone
            })
        
        # Get staff profile if exists
        staff_profile = None
        try:
            staff = Staff.objects.get(employee=employee)
            staff_profile = {
                'id': staff.id,
                'salary': float(staff.salary),
                'status': staff.status,
                'shift': staff.shift,
                'hire_date': staff.hire_date.isoformat(),
                'performance_rating': float(staff.performance_rating) if staff.performance_rating else None
            }
        except Staff.DoesNotExist:
            pass
        
        # Update last login
        employee.updated_at = timezone.now()
        employee.save()
        
        return Response({
            'access_token': str(access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': employee.id,
                'name': employee.name,
                'email': employee.email,
                'role': employee.role,
                'phone': employee.phone,
                'restaurants': restaurant_data,
                'restaurant_id': restaurants.first().id if restaurants.exists() else None,
                'staff_profile': staff_profile,
                'is_staff': True
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
        
        return Response({
            'message': 'Successfully logged out'
        })
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
                'error': 'Invalid token'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get employee info
        try:
            employee = Employee.objects.get(email=user.email)
            restaurants = employee.restaurants.all()
            
            return Response({
                'user': {
                    'id': employee.id,
                    'name': employee.name,
                    'email': employee.email,
                    'role': employee.role,
                    'phone': employee.phone,
                    'restaurants': [{'id': r.id, 'name': r.name} for r in restaurants],
                    'restaurant_id': restaurants.first().id if restaurants.exists() else None
                }
            })
        except Employee.DoesNotExist:
            return Response({
                'error': 'Employee not found'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({
            'error': f'Token verification failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
