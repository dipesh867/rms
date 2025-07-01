"""
Comprehensive API Views for Restaurant Management System
"""
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count, Avg, F
from django.db import models
from datetime import datetime, timedelta
from django.utils import timezone

from .models import (
    Restaurant, Employee, MenuCategory, MenuItem, InventoryCategory, 
    InventoryItem, Table, Chair, Customer, Order, OrderItem, 
    Vendor, Staff, Notification, Expense, WasteEntry
)
from .serializers import (
    RestaurantSerializer, EmployeeSerializer, MenuCategorySerializer, 
    MenuItemSerializer, InventoryCategorySerializer, InventoryItemSerializer,
    TableSerializer, ChairSerializer, CustomerSerializer, OrderSerializer,
    OrderItemSerializer, VendorSerializer, StaffSerializer, 
    NotificationSerializer, ExpenseSerializer, WasteEntrySerializer,
    AnalyticsSerializer
)


# === MENU MANAGEMENT VIEWS ===
class MenuCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = MenuCategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'is_active']
    search_fields = ['name', 'description']

    def get_queryset(self):
        return MenuCategory.objects.all()


class MenuCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuCategory.objects.all()
    serializer_class = MenuCategorySerializer


class MenuItemListCreateView(generics.ListCreateAPIView):
    serializer_class = MenuItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'category', 'available', 'is_vegan', 'is_gluten_free']
    search_fields = ['name', 'description', 'tags']

    def get_queryset(self):
        return MenuItem.objects.select_related('category', 'restaurant')


class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MenuItem.objects.select_related('category', 'restaurant')
    serializer_class = MenuItemSerializer


# === INVENTORY MANAGEMENT VIEWS ===
class InventoryCategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = InventoryCategorySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant']
    search_fields = ['name', 'description']

    def get_queryset(self):
        return InventoryCategory.objects.all()


class InventoryItemListCreateView(generics.ListCreateAPIView):
    serializer_class = InventoryItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'category', 'status', 'unit']
    search_fields = ['name', 'supplier', 'barcode']

    def get_queryset(self):
        return InventoryItem.objects.select_related('category', 'restaurant')


class InventoryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = InventoryItem.objects.select_related('category', 'restaurant')
    serializer_class = InventoryItemSerializer


@api_view(['POST'])
def update_inventory_stock(request, item_id):
    """Update inventory stock levels"""
    try:
        item = InventoryItem.objects.get(id=item_id)
        action = request.data.get('action')  # 'add' or 'subtract'
        quantity = float(request.data.get('quantity', 0))
        
        if action == 'add':
            item.current_stock += quantity
            item.last_restocked = timezone.now()
        elif action == 'subtract':
            item.current_stock = max(0, item.current_stock - quantity)
        
        item.update_status()
        
        return Response({
            'message': 'Stock updated successfully',
            'new_stock': item.current_stock,
            'status': item.status
        })
    except InventoryItem.DoesNotExist:
        return Response({'error': 'Item not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# === TABLE MANAGEMENT VIEWS ===
class TableListCreateView(generics.ListCreateAPIView):
    serializer_class = TableSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'status', 'section']
    search_fields = ['number', 'section']

    def get_queryset(self):
        return Table.objects.select_related('restaurant', 'waiter_assigned').prefetch_related('chairs')


class TableDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Table.objects.select_related('restaurant', 'waiter_assigned').prefetch_related('chairs')
    serializer_class = TableSerializer


@api_view(['POST'])
def update_table_status(request, table_id):
    """Update table status"""
    try:
        table = Table.objects.get(id=table_id)
        new_status = request.data.get('status')
        
        if new_status in ['available', 'occupied', 'reserved', 'cleaning']:
            table.status = new_status
            table.save()
            
            return Response({
                'message': 'Table status updated successfully',
                'status': table.status
            })
        else:
            return Response({'error': 'Invalid status'}, status=400)
    except Table.DoesNotExist:
        return Response({'error': 'Table not found'}, status=404)


# === CUSTOMER MANAGEMENT VIEWS ===
class CustomerListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'membership_tier']
    search_fields = ['name', 'email', 'phone']

    def get_queryset(self):
        return Customer.objects.select_related('restaurant')


class CustomerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Customer.objects.select_related('restaurant')
    serializer_class = CustomerSerializer


# === ORDER MANAGEMENT VIEWS ===
class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'status', 'order_type', 'table']
    search_fields = ['customer__name', 'notes']

    def get_queryset(self):
        return Order.objects.select_related(
            'restaurant', 'table', 'customer', 'waiter_assigned'
        ).prefetch_related('order_items__menu_item')


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.select_related(
        'restaurant', 'table', 'customer', 'waiter_assigned'
    ).prefetch_related('order_items__menu_item')
    serializer_class = OrderSerializer


@api_view(['POST'])
def update_order_status(request, order_id):
    """Update order status"""
    try:
        order = Order.objects.get(id=order_id)
        new_status = request.data.get('status')
        
        if new_status in ['active', 'completed', 'cancelled', 'payment-pending']:
            order.status = new_status
            order.save()
            
            # Update table status if order is completed
            if new_status == 'completed' and order.table:
                order.table.status = 'cleaning'
                order.table.save()
            
            return Response({
                'message': 'Order status updated successfully',
                'status': order.status
            })
        else:
            return Response({'error': 'Invalid status'}, status=400)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)


# === VENDOR MANAGEMENT VIEWS ===
class VendorListCreateView(generics.ListCreateAPIView):
    serializer_class = VendorSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['type', 'status']
    search_fields = ['name', 'email', 'address']

    def get_queryset(self):
        return Vendor.objects.all()


class VendorDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer


# === STAFF MANAGEMENT VIEWS ===
class StaffListCreateView(generics.ListCreateAPIView):
    serializer_class = StaffSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'shift', 'employee__role']
    search_fields = ['employee__name', 'employee__email']

    def get_queryset(self):
        return Staff.objects.select_related('employee')


class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Staff.objects.select_related('employee')
    serializer_class = StaffSerializer


# === NOTIFICATION VIEWS ===
class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type', 'read', 'user', 'restaurant']

    def get_queryset(self):
        return Notification.objects.select_related('user', 'restaurant')


@api_view(['POST'])
def mark_notification_read(request, notification_id):
    """Mark notification as read"""
    try:
        notification = Notification.objects.get(id=notification_id)
        notification.read = True
        notification.save()
        
        return Response({'message': 'Notification marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Notification not found'}, status=404)


# === EXPENSE TRACKING VIEWS ===
class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'category', 'approved', 'recurring']
    search_fields = ['description', 'payment_method']

    def get_queryset(self):
        return Expense.objects.select_related('restaurant', 'added_by')


class ExpenseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Expense.objects.select_related('restaurant', 'added_by')
    serializer_class = ExpenseSerializer


# === WASTE TRACKING VIEWS ===
class WasteEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = WasteEntrySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['restaurant', 'reason', 'date']
    search_fields = ['item_name', 'notes']

    def get_queryset(self):
        return WasteEntry.objects.select_related('restaurant', 'reported_by')


class WasteEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WasteEntry.objects.select_related('restaurant', 'reported_by')
    serializer_class = WasteEntrySerializer


# === ANALYTICS VIEWS ===
@api_view(['GET'])
def restaurant_analytics(request, restaurant_id):
    """Get comprehensive analytics for a restaurant"""
    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)

        # Date range (last 30 days by default)
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)

        # Basic metrics
        orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date__range=[start_date, end_date],
            status='completed'
        )

        total_revenue = orders.aggregate(Sum('total'))['total__sum'] or 0
        total_orders = orders.count()
        average_order_value = total_revenue / total_orders if total_orders > 0 else 0

        # Growth calculations (compare with previous period)
        prev_start = start_date - timedelta(days=30)
        prev_orders = Order.objects.filter(
            restaurant=restaurant,
            created_at__date__range=[prev_start, start_date],
            status='completed'
        )

        prev_revenue = prev_orders.aggregate(Sum('total'))['total__sum'] or 0
        prev_order_count = prev_orders.count()

        revenue_growth = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
        order_growth = ((total_orders - prev_order_count) / prev_order_count * 100) if prev_order_count > 0 else 0

        # Customer growth
        current_customers = Customer.objects.filter(
            restaurant=restaurant,
            created_at__date__range=[start_date, end_date]
        ).count()

        prev_customers = Customer.objects.filter(
            restaurant=restaurant,
            created_at__date__range=[prev_start, start_date]
        ).count()

        customer_growth = ((current_customers - prev_customers) / prev_customers * 100) if prev_customers > 0 else 0

        # Top selling items
        top_items = OrderItem.objects.filter(
            order__restaurant=restaurant,
            order__created_at__date__range=[start_date, end_date],
            order__status='completed'
        ).values('menu_item').annotate(
            total_quantity=Sum('quantity'),
            total_revenue=Sum('quantity') * Sum('unit_price')
        ).order_by('-total_quantity')[:5]

        top_selling_items = []
        for item in top_items:
            menu_item = MenuItem.objects.get(id=item['menu_item'])
            top_selling_items.append({
                'id': menu_item.id,
                'name': menu_item.name,
                'quantity_sold': item['total_quantity'],
                'revenue': item['total_revenue']
            })

        # Daily revenue for charts
        daily_revenue = []
        for i in range(30):
            date = end_date - timedelta(days=i)
            day_revenue = Order.objects.filter(
                restaurant=restaurant,
                created_at__date=date,
                status='completed'
            ).aggregate(Sum('total'))['total__sum'] or 0

            daily_revenue.append({
                'date': date.strftime('%Y-%m-%d'),
                'revenue': float(day_revenue)
            })

        # Monthly revenue (last 12 months)
        monthly_revenue = []
        for i in range(12):
            month_start = (end_date.replace(day=1) - timedelta(days=i*30)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)

            month_rev = Order.objects.filter(
                restaurant=restaurant,
                created_at__date__range=[month_start, month_end],
                status='completed'
            ).aggregate(Sum('total'))['total__sum'] or 0

            monthly_revenue.append({
                'month': month_start.strftime('%Y-%m'),
                'revenue': float(month_rev)
            })

        analytics_data = {
            'total_revenue': float(total_revenue),
            'total_orders': total_orders,
            'average_order_value': float(average_order_value),
            'revenue_growth': float(revenue_growth),
            'order_growth': float(order_growth),
            'customer_growth': float(customer_growth),
            'top_selling_items': top_selling_items,
            'daily_revenue': daily_revenue,
            'monthly_revenue': monthly_revenue
        }

        return Response(analytics_data)

    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
def inventory_alerts(request, restaurant_id):
    """Get inventory alerts for low stock, expired items, etc."""
    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)

        # Low stock items
        low_stock = InventoryItem.objects.filter(
            restaurant=restaurant,
            current_stock__lte=models.F('min_stock')
        )

        # Expired items
        expired_items = InventoryItem.objects.filter(
            restaurant=restaurant,
            expiry_date__lte=timezone.now().date()
        )

        # Items expiring soon (within 7 days)
        expiring_soon = InventoryItem.objects.filter(
            restaurant=restaurant,
            expiry_date__lte=timezone.now().date() + timedelta(days=7),
            expiry_date__gt=timezone.now().date()
        )

        alerts = {
            'low_stock': InventoryItemSerializer(low_stock, many=True).data,
            'expired': InventoryItemSerializer(expired_items, many=True).data,
            'expiring_soon': InventoryItemSerializer(expiring_soon, many=True).data
        }

        return Response(alerts)

    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
