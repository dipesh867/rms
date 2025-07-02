"""
Staff Dashboard Views
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count, Sum, Avg, F
from django.utils import timezone
from datetime import datetime, timedelta, date
import json

from superadmin.models import (
    Restaurant, Employee, Table, Chair, Order, OrderItem, Customer, Staff
)
from superadmin.serializers import (
    TableSerializer, OrderSerializer, CustomerSerializer, StaffSerializer
)


def check_staff_access(user_email, restaurant_id):
    """Check if user has staff access to restaurant"""
    try:
        employee = Employee.objects.get(email=user_email)
        return (employee.restaurants.filter(id=restaurant_id).exists() and
                employee.role in ['staff', 'manager', 'owner'])
    except Employee.DoesNotExist:
        return False


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_dashboard_stats(request, restaurant_id):
    """Staff dashboard statistics"""
    if not check_staff_access(request.user.email, restaurant_id):
        return Response({
            'error': 'Access denied to this restaurant'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        today = timezone.now().date()

        # Table status overview
        total_tables = Table.objects.filter(restaurant=restaurant).count()
        occupied_tables = Table.objects.filter(
            restaurant=restaurant,
            status='occupied'
        ).count()
        available_tables = Table.objects.filter(
            restaurant=restaurant,
            status='available'
        ).count()
        reserved_tables = Table.objects.filter(
            restaurant=restaurant,
            status='reserved'
        ).count()

        # Today's orders
        today_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date=today
        )

        active_orders = today_orders.filter(status='active').count()
        completed_orders = today_orders.filter(status='completed').count()

        # Customer metrics
        total_customers_today = Customer.objects.filter(
            restaurant=restaurant,
            created_at__date=today
        ).count()

        return Response({
            'restaurant': {
                'id': restaurant.pk,
                'name': restaurant.name
            },
            'table_overview': {
                'total_tables': total_tables,
                'occupied': occupied_tables,
                'available': available_tables,
                'reserved': reserved_tables,
                'occupancy_rate': round((occupied_tables / max(total_tables, 1)) * 100, 1)
            },
            'today_orders': {
                'active': active_orders,
                'completed': completed_orders,
                'total': today_orders.count()
            },
            'customers_today': total_customers_today,
            'last_updated': timezone.now().isoformat()
        })

    except Restaurant.DoesNotExist:
        return Response({
            'error': 'Restaurant not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch staff dashboard: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_table_management(request, restaurant_id):
    """Get all tables for staff management"""
    if not check_staff_access(request.user.email, restaurant_id):
        return Response({
            'error': 'Access denied to this restaurant'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        tables = Table.objects.filter(restaurant=restaurant).order_by('number')

        return Response({
            'tables': TableSerializer(tables, many=True).data,
            'last_updated': timezone.now().isoformat()
        })

    except Restaurant.DoesNotExist:
        return Response({
            'error': 'Restaurant not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch tables: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_table_status(request, restaurant_id, table_id):
    """Update table status"""
    if not check_staff_access(request.user.email, restaurant_id):
        return Response({
            'error': 'Access denied to this restaurant'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        table = Table.objects.get(id=table_id, restaurant=restaurant)

        new_status = request.data.get('status')
        if new_status not in ['available', 'occupied', 'reserved', 'cleaning']:
            return Response({
                'error': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)

        table.status = new_status
        table.save()

        return Response({
            'message': 'Table status updated successfully',
            'table': TableSerializer(table).data
        })

    except Restaurant.DoesNotExist:
        return Response({
            'error': 'Restaurant not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Table.DoesNotExist:
        return Response({
            'error': 'Table not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to update table status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
