"""
Kitchen Dashboard Views
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
    Restaurant, Employee, Order, OrderItem, MenuItem, InventoryItem,
    InventoryCategory, WasteEntry, Notification
)
from superadmin.serializers import (
    OrderSerializer, OrderItemSerializer, MenuItemSerializer,
    InventoryItemSerializer, WasteEntrySerializer, NotificationSerializer
)


def check_kitchen_access(user_email, restaurant_id):
    """Check if user has kitchen access to restaurant"""
    try:
        employee = Employee.objects.get(email=user_email)
        return (employee.restaurants.filter(id=restaurant_id).exists() and
                employee.role in ['kitchen', 'manager', 'owner'])
    except Employee.DoesNotExist:
        return False


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def kitchen_dashboard_stats(request, restaurant_id):
    """Kitchen dashboard statistics"""
    if not check_kitchen_access(request.user.email, restaurant_id):
        return Response({
            'error': 'Access denied to this restaurant kitchen'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        now = timezone.now()
        today = now.date()

        # Active order items by status
        pending_items = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='active',
            status='pending'
        ).select_related('order', 'menu_item', 'order__table').order_by('added_at')

        preparing_items = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='active',
            status='preparing'
        ).select_related('order', 'menu_item', 'order__table').order_by('added_at')

        ready_items = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='active',
            status='ready'
        ).select_related('order', 'menu_item', 'order__table').order_by('updated_at')

        # Today's kitchen metrics
        today_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date=today
        )

        completed_orders_today = today_orders.filter(status='completed').count()
        total_orders_today = today_orders.count()

        # Average preparation time
        completed_items_today = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__created_at__date=today,
            status='served'
        )

        avg_prep_time = 0
        if completed_items_today.exists():
            total_prep_time = 0
            count = 0
            for item in completed_items_today:
                if item.updated_at and item.added_at:
                    prep_time = (item.updated_at - item.added_at).total_seconds() / 60
                    total_prep_time += prep_time
                    count += 1

            if count > 0:
                avg_prep_time = total_prep_time / count

        # Inventory alerts for kitchen
        low_stock_ingredients = InventoryItem.objects.filter(
            restaurant=restaurant,
            status='low-stock'
        ).order_by('name')

        return Response({
            'restaurant': {
                'id': restaurant.pk,
                'name': restaurant.name
            },
            'queue_summary': {
                'pending_items': pending_items.count(),
                'preparing_items': preparing_items.count(),
                'ready_items': ready_items.count()
            },
            'today_metrics': {
                'completed_orders': completed_orders_today,
                'total_orders': total_orders_today,
                'avg_prep_time_minutes': round(avg_prep_time, 1)
            },
            'inventory_alerts': {
                'low_stock_count': low_stock_ingredients.count(),
                'low_stock_items': [
                    {
                        'name': item.name,
                        'current_stock': item.current_stock,
                        'minimum_stock': item.min_stock
                    }
                    for item in low_stock_ingredients[:5]
                ]
            },
            'pending_queue': [
                {
                    'id': item.pk,
                    'menu_item': item.menu_item.name,
                    'quantity': item.quantity,
                    'table_number': item.order.table.number if item.order.table else None,
                    'order_id': item.order.id,
                    'added_at': item.added_at.isoformat()
                }
                for item in pending_items[:10]
            ],
            'preparing_queue': [
                {
                    'id': item.pk,
                    'menu_item': item.menu_item.name,
                    'quantity': item.quantity,
                    'table_number': item.order.table.number if item.order.table else None,
                    'order_id': item.order.id,
                    'started_at': item.updated_at.isoformat() if item.updated_at else None
                }
                for item in preparing_items[:10]
            ],
            'ready_queue': [
                {
                    'id': item.pk,
                    'menu_item': item.menu_item.name,
                    'quantity': item.quantity,
                    'table_number': item.order.table.number if item.order.table else None,
                    'order_id': item.order.id,
                    'ready_at': item.updated_at.isoformat() if item.updated_at else None
                }
                for item in ready_items[:10]
            ],
            'last_updated': timezone.now().isoformat()
        })

    except Restaurant.DoesNotExist:
        return Response({
            'error': 'Restaurant not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch kitchen dashboard: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
