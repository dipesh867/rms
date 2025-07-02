"""
Owner Dashboard Views for Restaurant Management System
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
    Restaurant, Employee, Order, OrderItem, MenuCategory, MenuItem,
    InventoryItem, InventoryCategory, Table, Chair, Customer, Staff,
    Notification, Expense, WasteEntry, Vendor
)
from superadmin.serializers import (
    RestaurantSerializer, EmployeeSerializer, OrderSerializer,
    MenuItemSerializer, InventoryItemSerializer, TableSerializer,
    CustomerSerializer, StaffSerializer, NotificationSerializer,
    ExpenseSerializer
)


def check_restaurant_access(user_email, restaurant_id):
    """Check if user has access to restaurant"""
    try:
        employee = Employee.objects.get(email=user_email)
        return employee.restaurants.filter(id=restaurant_id).exists()
    except Employee.DoesNotExist:
        return False


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def owner_dashboard_stats(request, restaurant_id):
    """Owner dashboard statistics for specific restaurant"""
    if not check_restaurant_access(request.user.email, restaurant_id):
        return Response({
            'error': 'Access denied to this restaurant'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Today's metrics
        today_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date=today
        )

        today_revenue = today_orders.filter(
            status='completed'
        ).aggregate(total=Sum('total'))['total'] or 0

        today_order_count = today_orders.count()
        active_orders = today_orders.filter(status='active').count()

        # Weekly comparison
        week_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date=week_ago
        )

        week_revenue = week_orders.filter(
            status='completed'
        ).aggregate(total=Sum('total'))['total'] or 0

        revenue_change = 0
        if week_revenue > 0:
            revenue_change = ((today_revenue - week_revenue) / week_revenue) * 100

        # Monthly metrics
        monthly_revenue = Order.objects.filter(
            restaurant=restaurant,
            status='completed',
            created_at__gte=month_ago
        ).aggregate(total=Sum('total'))['total'] or 0

        monthly_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__gte=month_ago
        ).count()

        # Table occupancy
        total_tables = Table.objects.filter(restaurant=restaurant).count()
        occupied_tables = Table.objects.filter(
            restaurant=restaurant,
            status='occupied'
        ).count()

        occupancy_rate = (occupied_tables / max(total_tables, 1)) * 100

        # Staff metrics
        total_staff = Employee.objects.filter(
            restaurants=restaurant
        ).count()

        active_staff = Staff.objects.filter(
            employee__restaurants=restaurant,
            status='active'
        ).count()

        # Customer metrics
        total_customers = Customer.objects.filter(restaurant=restaurant).count()

        # Inventory alerts
        low_stock_items = InventoryItem.objects.filter(
            restaurant=restaurant,
            status='low-stock'
        ).count()

        out_of_stock_items = InventoryItem.objects.filter(
            restaurant=restaurant,
            status='out-of-stock'
        ).count()

        return Response({
            'restaurant': {
                'id': restaurant.pk,
                'name': restaurant.name,
                'email': restaurant.email,
                'address': restaurant.address
            },
            'today_metrics': {
                'revenue': float(today_revenue),
                'orders': today_order_count,
                'active_orders': active_orders,
                'revenue_change': round(revenue_change, 1)
            },
            'monthly_metrics': {
                'revenue': float(monthly_revenue),
                'orders': monthly_orders,
                'avg_order_value': float(monthly_revenue / max(monthly_orders, 1))
            },
            'operations': {
                'table_occupancy': round(occupancy_rate, 1),
                'occupied_tables': occupied_tables,
                'total_tables': total_tables,
                'total_staff': total_staff,
                'active_staff': active_staff,
                'total_customers': total_customers
            },
            'inventory_alerts': {
                'low_stock': low_stock_items,
                'out_of_stock': out_of_stock_items
            },
            'last_updated': timezone.now().isoformat()
        })

    except Restaurant.DoesNotExist:
        return Response({
            'error': 'Restaurant not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch dashboard stats: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def restaurant_analytics(request, restaurant_id):
    """Detailed analytics for restaurant owner"""
    if not check_restaurant_access(request.user.email, restaurant_id):
        return Response({
            'error': 'Access denied to this restaurant'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)

        # Date range
        days = int(request.GET.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)

        # Revenue trends
        revenue_data = []
        for i in range(days):
            date = end_date - timedelta(days=i)
            daily_revenue = Order.objects.filter(
                restaurant=restaurant,
                status='completed',
                created_at__date=date
            ).aggregate(total=Sum('total'))['total'] or 0

            daily_orders = Order.objects.filter(
                restaurant=restaurant,
                created_at__date=date
            ).count()

            revenue_data.append({
                'date': date.isoformat(),
                'revenue': float(daily_revenue),
                'orders': daily_orders
            })

        revenue_data.reverse()

        return Response({
            'revenue_trends': revenue_data,
            'last_updated': timezone.now().isoformat()
        })

    except Restaurant.DoesNotExist:
        return Response({
            'error': 'Restaurant not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_expense(request, restaurant_id):
    """Create new expense"""
    if not check_restaurant_access(request.user.email, restaurant_id):
        return Response({
            'error': 'Access denied to this restaurant'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        employee = Employee.objects.get(email=request.user.email)

        data = request.data
        required_fields = ['description', 'amount', 'category', 'date']

        for field in required_fields:
            if field not in data:
                return Response({
                    'error': f'{field} is required'
                }, status=status.HTTP_400_BAD_REQUEST)

        expense = Expense.objects.create(
            restaurant=restaurant,
            added_by=employee,
            description=data['description'],
            amount=data['amount'],
            category=data['category'],
            date=data['date'],
            payment_method=data.get('payment_method', ''),
            receipt=data.get('receipt', ''),
            recurring=data.get('recurring', False)
        )

        return Response({
            'message': 'Expense created successfully',
            'expense': ExpenseSerializer(expense).data
        }, status=status.HTTP_201_CREATED)

    except Restaurant.DoesNotExist:
        return Response({
            'error': 'Restaurant not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Employee.DoesNotExist:
        return Response({
            'error': 'Employee not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to create expense: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
