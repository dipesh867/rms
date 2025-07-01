"""
Role-based views and dashboard APIs for different user types
"""
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Sum, Count, Avg, F
from django.utils import timezone
from datetime import datetime, timedelta, date
from django.db import models

from .models import (
    Restaurant, Employee, MenuCategory, MenuItem, InventoryItem, 
    Table, Chair, Customer, Order, OrderItem, Vendor, Staff, 
    Notification, Expense, WasteEntry, DailyStats
)
from .serializers import (
    RestaurantSerializer, EmployeeSerializer, MenuItemSerializer,
    InventoryItemSerializer, TableSerializer, OrderSerializer,
    CustomerSerializer, VendorSerializer, NotificationSerializer
)


# === PERMISSION HELPERS ===
def get_user_restaurants(user_email):
    """Get restaurants associated with a user"""
    try:
        employee = Employee.objects.get(email=user_email)
        return employee.restaurants.all()
    except Employee.DoesNotExist:
        return Restaurant.objects.none()


def check_restaurant_access(user_email, restaurant_id):
    """Check if user has access to a specific restaurant"""
    user_restaurants = get_user_restaurants(user_email)
    return user_restaurants.filter(id=restaurant_id).exists()


# === ADMINISTRATOR DASHBOARD APIs ===
@api_view(['GET'])
def admin_dashboard_stats(request):
    """Comprehensive admin dashboard statistics"""
    try:
        # System-wide statistics
        total_restaurants = Restaurant.objects.count()
        total_employees = Employee.objects.count()
        total_vendors = Vendor.objects.count()
        total_orders_today = Order.objects.filter(
            created_at__date=timezone.now().date()
        ).count()
        
        # Revenue statistics
        today_revenue = Order.objects.filter(
            created_at__date=timezone.now().date(),
            status='completed'
        ).aggregate(Sum('total'))['total__sum'] or 0
        
        # Growth calculations (vs last week)
        last_week = timezone.now().date() - timedelta(days=7)
        last_week_revenue = Order.objects.filter(
            created_at__date=last_week,
            status='completed'
        ).aggregate(Sum('total'))['total__sum'] or 0
        
        revenue_growth = ((today_revenue - last_week_revenue) / last_week_revenue * 100) if last_week_revenue > 0 else 0
        
        # Top performing restaurants
        top_restaurants = Restaurant.objects.annotate(
            total_revenue=Sum('orders__total', filter=Q(orders__status='completed')),
            total_orders=Count('orders', filter=Q(orders__status='completed'))
        ).order_by('-total_revenue')[:5]
        
        # System alerts
        low_stock_alerts = InventoryItem.objects.filter(
            current_stock__lte=F('min_stock')
        ).count()
        
        pending_vendor_approvals = Vendor.objects.filter(
            status='pending-approval'
        ).count()
        
        # Recent activities
        recent_restaurants = Restaurant.objects.order_by('-created_at')[:5]
        recent_orders = Order.objects.select_related('restaurant').order_by('-created_at')[:10]
        
        data = {
            'overview': {
                'total_restaurants': total_restaurants,
                'total_employees': total_employees,
                'total_vendors': total_vendors,
                'total_orders_today': total_orders_today,
                'today_revenue': float(today_revenue),
                'revenue_growth': float(revenue_growth)
            },
            'top_restaurants': [
                {
                    'id': r.id,
                    'name': r.name,
                    'revenue': float(r.total_revenue or 0),
                    'orders': r.total_orders
                } for r in top_restaurants
            ],
            'alerts': {
                'low_stock_items': low_stock_alerts,
                'pending_vendor_approvals': pending_vendor_approvals
            },
            'recent_activities': {
                'new_restaurants': RestaurantSerializer(recent_restaurants, many=True).data,
                'recent_orders': [
                    {
                        'id': o.id,
                        'restaurant': o.restaurant.name,
                        'total': float(o.total),
                        'status': o.status,
                        'created_at': o.created_at
                    } for o in recent_orders
                ]
            }
        }
        
        return Response(data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === RESTAURANT OWNER DASHBOARD APIs ===
@api_view(['GET'])
def owner_dashboard_stats(request, restaurant_id):
    """Restaurant owner dashboard statistics"""
    try:
        # Verify access
        if not check_restaurant_access(request.user.email, restaurant_id):
            return Response({'error': 'Access denied'}, status=403)
        
        restaurant = Restaurant.objects.get(id=restaurant_id)
        today = timezone.now().date()
        
        # Today's statistics
        today_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date=today
        )
        
        today_revenue = today_orders.filter(status='completed').aggregate(
            Sum('total'))['total__sum'] or 0
        
        today_order_count = today_orders.count()
        active_orders = today_orders.filter(status='active').count()
        
        # Table statistics
        total_tables = Table.objects.filter(restaurant=restaurant).count()
        occupied_tables = Table.objects.filter(
            restaurant=restaurant, 
            status='occupied'
        ).count()
        
        table_occupancy = (occupied_tables / total_tables * 100) if total_tables > 0 else 0
        
        # Staff statistics
        total_staff = Employee.objects.filter(restaurants=restaurant).count()
        staff_on_duty = Staff.objects.filter(
            employee__restaurants=restaurant,
            status='active'
        ).count()
        
        # Inventory alerts
        low_stock_items = InventoryItem.objects.filter(
            restaurant=restaurant,
            current_stock__lte=F('min_stock')
        ).count()
        
        # Customer statistics
        total_customers = Customer.objects.filter(restaurant=restaurant).count()
        new_customers_today = Customer.objects.filter(
            restaurant=restaurant,
            created_at__date=today
        ).count()
        
        # Top selling items today
        top_items = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__created_at__date=today,
            order__status='completed'
        ).values('menu_item__name').annotate(
            quantity_sold=Sum('quantity'),
            revenue=Sum(F('quantity') * F('unit_price'))
        ).order_by('-quantity_sold')[:5]
        
        # Recent orders
        recent_orders = Order.objects.filter(
            restaurant=restaurant
        ).select_related('customer', 'table').order_by('-created_at')[:10]
        
        # Weekly revenue trend
        weekly_revenue = []
        for i in range(7):
            date_check = today - timedelta(days=i)
            day_revenue = Order.objects.filter(
                restaurant=restaurant,
                created_at__date=date_check,
                status='completed'
            ).aggregate(Sum('total'))['total__sum'] or 0
            
            weekly_revenue.append({
                'date': date_check.strftime('%Y-%m-%d'),
                'revenue': float(day_revenue)
            })
        
        data = {
            'overview': {
                'today_revenue': float(today_revenue),
                'today_orders': today_order_count,
                'active_orders': active_orders,
                'table_occupancy': round(table_occupancy, 1),
                'staff_on_duty': staff_on_duty,
                'total_staff': total_staff,
                'low_stock_alerts': low_stock_items,
                'total_customers': total_customers,
                'new_customers_today': new_customers_today
            },
            'top_selling_items': list(top_items),
            'recent_orders': [
                {
                    'id': o.id,
                    'customer': o.customer.name if o.customer else 'Walk-in',
                    'table': o.table.number if o.table else None,
                    'total': float(o.total),
                    'status': o.status,
                    'created_at': o.created_at
                } for o in recent_orders
            ],
            'weekly_revenue': weekly_revenue,
            'restaurant_info': {
                'name': restaurant.name,
                'address': restaurant.address,
                'phone': restaurant.phone,
                'email': restaurant.email
            }
        }
        
        return Response(data)
        
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === MANAGER DASHBOARD APIs ===
@api_view(['GET'])
def manager_dashboard_stats(request, restaurant_id):
    """Restaurant manager dashboard statistics"""
    try:
        # Verify access
        if not check_restaurant_access(request.user.email, restaurant_id):
            return Response({'error': 'Access denied'}, status=403)
        
        restaurant = Restaurant.objects.get(id=restaurant_id)
        today = timezone.now().date()
        now = timezone.now()
        
        # Real-time operational data
        active_orders = Order.objects.filter(
            restaurant=restaurant,
            status='active'
        ).count()
        
        # Kitchen performance
        pending_items = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='active',
            status__in=['pending', 'preparing']
        ).count()
        
        ready_items = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='active',
            status='ready'
        ).count()
        
        # Table management
        tables = Table.objects.filter(restaurant=restaurant)
        table_stats = {
            'total': tables.count(),
            'occupied': tables.filter(status='occupied').count(),
            'available': tables.filter(status='available').count(),
            'reserved': tables.filter(status='reserved').count(),
            'cleaning': tables.filter(status='cleaning').count()
        }
        
        # Staff management
        staff_stats = Staff.objects.filter(
            employee__restaurants=restaurant
        ).aggregate(
            total=Count('id'),
            active=Count('id', filter=Q(status='active')),
            on_leave=Count('id', filter=Q(status='on-leave'))
        )
        
        # Inventory alerts
        inventory_alerts = {
            'low_stock': InventoryItem.objects.filter(
                restaurant=restaurant,
                current_stock__lte=F('min_stock')
            ).count(),
            'expired': InventoryItem.objects.filter(
                restaurant=restaurant,
                expiry_date__lte=today
            ).count(),
            'expiring_soon': InventoryItem.objects.filter(
                restaurant=restaurant,
                expiry_date__lte=today + timedelta(days=3),
                expiry_date__gt=today
            ).count()
        }
        
        # Performance metrics
        today_performance = {
            'orders_completed': Order.objects.filter(
                restaurant=restaurant,
                created_at__date=today,
                status='completed'
            ).count(),
            'revenue': Order.objects.filter(
                restaurant=restaurant,
                created_at__date=today,
                status='completed'
            ).aggregate(Sum('total'))['total__sum'] or 0,
            'avg_order_value': Order.objects.filter(
                restaurant=restaurant,
                created_at__date=today,
                status='completed'
            ).aggregate(Avg('total'))['total__avg'] or 0
        }
        
        # Recent notifications
        notifications = Notification.objects.filter(
            restaurant=restaurant,
            read=False
        ).order_by('-created_at')[:5]
        
        data = {
            'real_time': {
                'active_orders': active_orders,
                'pending_kitchen_items': pending_items,
                'ready_items': ready_items,
                'timestamp': now.isoformat()
            },
            'tables': table_stats,
            'staff': staff_stats,
            'inventory_alerts': inventory_alerts,
            'today_performance': {
                'orders_completed': today_performance['orders_completed'],
                'revenue': float(today_performance['revenue']),
                'avg_order_value': float(today_performance['avg_order_value'])
            },
            'notifications': NotificationSerializer(notifications, many=True).data
        }
        
        return Response(data)
        
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === KITCHEN STAFF DASHBOARD APIs ===
@api_view(['GET'])
def kitchen_dashboard_stats(request, restaurant_id):
    """Kitchen staff dashboard for order management"""
    try:
        # Verify access
        if not check_restaurant_access(request.user.email, restaurant_id):
            return Response({'error': 'Access denied'}, status=403)

        restaurant = Restaurant.objects.get(id=restaurant_id)
        now = timezone.now()

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

        # Kitchen performance metrics
        today = timezone.now().date()
        completed_today = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__created_at__date=today,
            status='served'
        ).count()

        # Priority orders (waiting > 30 minutes)
        priority_cutoff = now - timedelta(minutes=30)
        priority_items = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='active',
            status__in=['pending', 'preparing'],
            added_at__lte=priority_cutoff
        ).select_related('order', 'menu_item', 'order__table')

        data = {
            'queue': {
                'pending': [
                    {
                        'id': item.id,
                        'order_id': item.order.id,
                        'menu_item': item.menu_item.name,
                        'quantity': item.quantity,
                        'table': item.order.table.number if item.order.table else None,
                        'notes': item.notes,
                        'customizations': item.customizations,
                        'added_at': item.added_at,
                        'prep_time': item.menu_item.preparation_time
                    } for item in pending_items
                ],
                'preparing': [
                    {
                        'id': item.id,
                        'order_id': item.order.id,
                        'menu_item': item.menu_item.name,
                        'quantity': item.quantity,
                        'table': item.order.table.number if item.order.table else None,
                        'notes': item.notes,
                        'customizations': item.customizations,
                        'started_at': item.updated_at,
                        'prep_time': item.menu_item.preparation_time
                    } for item in preparing_items
                ],
                'ready': [
                    {
                        'id': item.id,
                        'order_id': item.order.id,
                        'menu_item': item.menu_item.name,
                        'quantity': item.quantity,
                        'table': item.order.table.number if item.order.table else None,
                        'ready_at': item.updated_at
                    } for item in ready_items
                ]
            },
            'performance': {
                'completed_today': completed_today,
                'priority_orders': priority_items.count()
            },
            'priority_items': [
                {
                    'id': item.id,
                    'order_id': item.order.id,
                    'menu_item': item.menu_item.name,
                    'quantity': item.quantity,
                    'table': item.order.table.number if item.order.table else None,
                    'waiting_time_minutes': (now - item.added_at).total_seconds() / 60,
                    'status': item.status
                } for item in priority_items
            ]
        }

        return Response(data)

    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['POST'])
def update_kitchen_item_status(request, item_id):
    """Update order item status from kitchen"""
    try:
        item = OrderItem.objects.get(id=item_id)
        new_status = request.data.get('status')

        # Verify access
        if not check_restaurant_access(request.user.email, item.order.restaurant.id):
            return Response({'error': 'Access denied'}, status=403)

        if new_status in ['pending', 'preparing', 'ready', 'served']:
            item.status = new_status
            item.save()

            # Create notification for ready items
            if new_status == 'ready':
                Notification.objects.create(
                    title=f"Order Ready - Table {item.order.table.number if item.order.table else 'Takeaway'}",
                    message=f"{item.menu_item.name} x{item.quantity} is ready for serving",
                    type='info',
                    restaurant=item.order.restaurant
                )

            return Response({
                'message': 'Item status updated successfully',
                'status': item.status
            })
        else:
            return Response({'error': 'Invalid status'}, status=400)

    except OrderItem.DoesNotExist:
        return Response({'error': 'Order item not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === VENDOR MANAGEMENT APIs ===
@api_view(['GET'])
def vendor_dashboard_stats(request, vendor_id):
    """Vendor dashboard statistics"""
    try:
        vendor = Vendor.objects.get(id=vendor_id)

        data = {
            'overview': {
                'total_orders': vendor.total_orders,
                'total_revenue': float(vendor.revenue),
                'current_rating': float(vendor.rating),
                'status': vendor.status,
                'commission_rate': float(vendor.commission)
            },
            'vendor_info': {
                'name': vendor.name,
                'type': vendor.type,
                'email': vendor.email,
                'phone': vendor.phone,
                'address': vendor.address,
                'delivery_radius': vendor.delivery_radius,
                'minimum_order': float(vendor.minimum_order) if vendor.minimum_order else 0
            }
        }

        return Response(data)

    except Vendor.DoesNotExist:
        return Response({'error': 'Vendor not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def restaurant_vendor_management(request, restaurant_id):
    """Restaurant's vendor management dashboard"""
    try:
        # Verify access
        if not check_restaurant_access(request.user.email, restaurant_id):
            return Response({'error': 'Access denied'}, status=403)

        restaurant = Restaurant.objects.get(id=restaurant_id)

        # All vendors (for potential partnerships)
        all_vendors = Vendor.objects.filter(status='active')

        # Vendor categories
        vendor_stats = {
            'total_vendors': all_vendors.count(),
            'by_type': list(all_vendors.values('type').annotate(
                count=Count('id')
            ).order_by('type')),
            'top_rated': VendorSerializer(all_vendors.filter(
                rating__gte=4.0
            ).order_by('-rating')[:5], many=True).data
        }

        data = {
            'vendor_stats': vendor_stats,
            'available_vendors': VendorSerializer(all_vendors[:20], many=True).data,
            'restaurant_info': {
                'name': restaurant.name,
                'address': restaurant.address
            }
        }

        return Response(data)

    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
