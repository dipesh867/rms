"""
Staff management and real-time APIs
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q, Sum, Count, Avg, F
from django.utils import timezone
from datetime import datetime, timedelta

from .models import (
    Restaurant, Employee, Staff, Order, OrderItem, Table, 
    InventoryItem, Notification, Expense, WasteEntry
)
from .serializers import StaffSerializer, EmployeeSerializer, NotificationSerializer
from .role_based_views import check_restaurant_access


# === STAFF MANAGEMENT APIs ===
@api_view(['GET'])
def staff_dashboard_stats(request, restaurant_id):
    """Staff dashboard for restaurant employees"""
    try:
        # Verify access
        if not check_restaurant_access(request.user.email, restaurant_id):
            return Response({'error': 'Access denied'}, status=403)
        
        restaurant = Restaurant.objects.get(id=restaurant_id)
        today = timezone.now().date()
        
        # Staff member's personal stats
        try:
            employee = Employee.objects.get(email=request.user.email)
            staff_profile = Staff.objects.get(employee=employee)
        except (Employee.DoesNotExist, Staff.DoesNotExist):
            staff_profile = None
        
        # Today's tasks and assignments
        assigned_tables = Table.objects.filter(
            restaurant=restaurant,
            waiter_assigned__email=request.user.email
        )
        
        assigned_orders = Order.objects.filter(
            restaurant=restaurant,
            waiter_assigned__email=request.user.email,
            created_at__date=today
        )
        
        # Performance metrics
        completed_orders = assigned_orders.filter(status='completed').count()
        total_revenue = assigned_orders.filter(status='completed').aggregate(
            Sum('total'))['total__sum'] or 0
        
        # Current shift info
        current_shift = staff_profile.shift if staff_profile else 'Not assigned'
        
        # Notifications for staff
        staff_notifications = Notification.objects.filter(
            Q(user__email=request.user.email) | Q(restaurant=restaurant),
            read=False
        ).order_by('-created_at')[:10]
        
        data = {
            'personal_info': {
                'name': employee.name if employee else 'Unknown',
                'role': employee.role if employee else 'staff',
                'shift': current_shift,
                'status': staff_profile.status if staff_profile else 'active'
            },
            'today_performance': {
                'assigned_tables': assigned_tables.count(),
                'orders_handled': assigned_orders.count(),
                'orders_completed': completed_orders,
                'revenue_generated': float(total_revenue)
            },
            'assigned_tables': [
                {
                    'id': table.id,
                    'number': table.number,
                    'capacity': table.capacity,
                    'status': table.status,
                    'section': table.section
                } for table in assigned_tables
            ],
            'recent_orders': [
                {
                    'id': order.id,
                    'table': order.table.number if order.table else None,
                    'total': float(order.total),
                    'status': order.status,
                    'created_at': order.created_at
                } for order in assigned_orders.order_by('-created_at')[:5]
            ],
            'notifications': NotificationSerializer(staff_notifications, many=True).data
        }
        
        return Response(data)
        
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def staff_schedule(request, restaurant_id):
    """Get staff schedule and shift information"""
    try:
        # Verify access
        if not check_restaurant_access(request.user.email, restaurant_id):
            return Response({'error': 'Access denied'}, status=403)
        
        restaurant = Restaurant.objects.get(id=restaurant_id)
        
        # All staff members
        all_staff = Staff.objects.filter(
            employee__restaurants=restaurant
        ).select_related('employee')
        
        # Group by shift
        shift_schedule = {
            'morning': [],
            'afternoon': [],
            'night': [],
            'split': []
        }
        
        for staff in all_staff:
            shift_schedule[staff.shift].append({
                'id': staff.id,
                'name': staff.employee.name,
                'role': staff.employee.role,
                'status': staff.status,
                'phone': staff.employee.phone,
                'performance_rating': float(staff.performance_rating) if staff.performance_rating else 0
            })
        
        # Staff statistics
        staff_stats = {
            'total_staff': all_staff.count(),
            'active_staff': all_staff.filter(status='active').count(),
            'on_leave': all_staff.filter(status='on-leave').count(),
            'by_role': list(all_staff.values('employee__role').annotate(
                count=Count('id')
            ))
        }
        
        data = {
            'schedule': shift_schedule,
            'statistics': staff_stats
        }
        
        return Response(data)
        
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === REAL-TIME UPDATES APIs ===
@api_view(['GET'])
def real_time_restaurant_status(request, restaurant_id):
    """Get real-time restaurant status updates"""
    try:
        # Verify access
        if not check_restaurant_access(request.user.email, restaurant_id):
            return Response({'error': 'Access denied'}, status=403)
        
        restaurant = Restaurant.objects.get(id=restaurant_id)
        now = timezone.now()
        
        # Real-time order status
        active_orders = Order.objects.filter(
            restaurant=restaurant,
            status='active'
        ).count()
        
        # Kitchen queue
        kitchen_queue = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='active'
        ).aggregate(
            pending=Count('id', filter=Q(status='pending')),
            preparing=Count('id', filter=Q(status='preparing')),
            ready=Count('id', filter=Q(status='ready'))
        )
        
        # Table status
        table_status = Table.objects.filter(
            restaurant=restaurant
        ).aggregate(
            total=Count('id'),
            occupied=Count('id', filter=Q(status='occupied')),
            available=Count('id', filter=Q(status='available')),
            reserved=Count('id', filter=Q(status='reserved')),
            cleaning=Count('id', filter=Q(status='cleaning'))
        )
        
        # Staff on duty
        staff_on_duty = Staff.objects.filter(
            employee__restaurants=restaurant,
            status='active'
        ).count()
        
        # Recent activities (last 30 minutes)
        recent_cutoff = now - timedelta(minutes=30)
        recent_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__gte=recent_cutoff
        ).count()
        
        # Alerts
        alerts = []
        
        # Low stock alerts
        low_stock_count = InventoryItem.objects.filter(
            restaurant=restaurant,
            current_stock__lte=F('min_stock')
        ).count()
        
        if low_stock_count > 0:
            alerts.append({
                'type': 'warning',
                'message': f'{low_stock_count} items are low in stock',
                'action': 'Check inventory'
            })
        
        # Long waiting orders
        long_wait_orders = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__status='active',
            status__in=['pending', 'preparing'],
            added_at__lte=now - timedelta(minutes=30)
        ).count()
        
        if long_wait_orders > 0:
            alerts.append({
                'type': 'error',
                'message': f'{long_wait_orders} orders waiting over 30 minutes',
                'action': 'Check kitchen'
            })
        
        data = {
            'timestamp': now.isoformat(),
            'orders': {
                'active': active_orders,
                'recent_30min': recent_orders
            },
            'kitchen': kitchen_queue,
            'tables': table_status,
            'staff_on_duty': staff_on_duty,
            'alerts': alerts,
            'restaurant': {
                'name': restaurant.name,
                'status': 'open'  # You can add business hours logic here
            }
        }
        
        return Response(data)
        
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


# === NOTIFICATION MANAGEMENT ===
@api_view(['POST'])
def create_notification(request, restaurant_id):
    """Create a new notification"""
    try:
        # Verify access
        if not check_restaurant_access(request.user.email, restaurant_id):
            return Response({'error': 'Access denied'}, status=403)
        
        restaurant = Restaurant.objects.get(id=restaurant_id)
        
        title = request.data.get('title')
        message = request.data.get('message')
        notification_type = request.data.get('type', 'info')
        target_user_email = request.data.get('target_user')
        
        # Create notification
        notification_data = {
            'title': title,
            'message': message,
            'type': notification_type,
            'restaurant': restaurant
        }
        
        if target_user_email:
            try:
                target_user = Employee.objects.get(email=target_user_email)
                notification_data['user'] = target_user
            except Employee.DoesNotExist:
                pass
        
        notification = Notification.objects.create(**notification_data)
        
        return Response({
            'message': 'Notification created successfully',
            'notification_id': notification.id
        })
        
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def get_user_notifications(request):
    """Get notifications for the current user"""
    try:
        user_email = request.user.email
        
        # Get user's notifications
        notifications = Notification.objects.filter(
            Q(user__email=user_email) | Q(user__isnull=True)
        ).order_by('-created_at')[:20]
        
        # Mark as read if requested
        if request.GET.get('mark_read') == 'true':
            notifications.filter(user__email=user_email).update(read=True)
        
        return Response({
            'notifications': NotificationSerializer(notifications, many=True).data,
            'unread_count': notifications.filter(read=False).count()
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)
