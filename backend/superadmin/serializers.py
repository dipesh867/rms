from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import (
    Restaurant, Employee, DailyStats, MenuCategory, MenuItem,
    InventoryCategory, InventoryItem, Table, Chair, Customer,
    Order, OrderItem, Vendor, Staff, Notification, Expense, WasteEntry
)

class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=6)
    phone = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Employee
        fields = ['name', 'email', 'phone', 'role', 'password']

class RestaurantSerializer(serializers.ModelSerializer):
    owner = EmployeeSerializer(write_only=True)

    class Meta:
        model = Restaurant
        fields = ['name', 'email', 'address', 'phone', 'owner']

    def create(self, validated_data):
        owner_data = validated_data.pop('owner')

        # Create restaurant first
        restaurant = Restaurant.objects.create(**validated_data)

        # Create owner employee, assign role and link to restaurant
        owner = Employee.objects.create(
            name=owner_data['name'],
            email=owner_data['email'],
            phone=owner_data.get('phone', ''),  # Use empty string if phone not provided
            role='owner',
            password=make_password(owner_data['password'])  # Hash the password for security
        )
        owner.restaurants.add(restaurant)
        owner.save()

        return restaurant


# === MENU SERIALIZERS ===
class MenuCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = MenuCategory
        fields = ['id', 'name', 'description', 'restaurant', 'display_order', 'is_active', 'items_count', 'created_at', 'updated_at']

    def get_items_count(self, obj):
        return obj.items.count()


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            'id', 'name', 'description', 'price', 'category', 'category_name',
            'restaurant', 'restaurant_name', 'image_url', 'available',
            'preparation_time', 'allergens', 'ingredients', 'calories',
            'is_vegan', 'is_gluten_free', 'tags', 'created_at', 'updated_at'
        ]


# === INVENTORY SERIALIZERS ===
class InventoryCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = InventoryCategory
        fields = ['id', 'name', 'description', 'restaurant', 'items_count', 'created_at']

    def get_items_count(self, obj):
        return obj.items.count()


class InventoryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    stock_value = serializers.SerializerMethodField()

    class Meta:
        model = InventoryItem
        fields = [
            'id', 'name', 'category', 'category_name', 'restaurant', 'restaurant_name',
            'current_stock', 'min_stock', 'max_stock', 'unit', 'cost_per_unit',
            'supplier', 'last_restocked', 'expiry_date', 'location', 'barcode',
            'status', 'stock_value', 'created_at', 'updated_at'
        ]

    def get_stock_value(self, obj):
        return float(obj.current_stock * obj.cost_per_unit)


# === TABLE SERIALIZERS ===
class ChairSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chair
        fields = ['id', 'number', 'table', 'status', 'customer_name', 'created_at', 'updated_at']


class TableSerializer(serializers.ModelSerializer):
    chairs = ChairSerializer(many=True, read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    waiter_name = serializers.CharField(source='waiter_assigned.name', read_only=True)
    current_order_id = serializers.SerializerMethodField()

    class Meta:
        model = Table
        fields = [
            'id', 'number', 'restaurant', 'restaurant_name', 'capacity', 'status',
            'section', 'qr_code', 'waiter_assigned', 'waiter_name', 'reservation_time',
            'shape', 'position_x', 'position_y', 'chairs', 'current_order_id',
            'created_at', 'updated_at'
        ]

    def get_current_order_id(self, obj):
        current_order = obj.orders.filter(status='active').first()
        return current_order.id if current_order else None


# === CUSTOMER SERIALIZERS ===
class CustomerSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    orders_count = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            'id', 'name', 'email', 'phone', 'restaurant', 'restaurant_name',
            'loyalty_points', 'total_orders', 'total_spent', 'last_visit',
            'membership_tier', 'preferred_payment_method', 'dietary_restrictions',
            'birthday', 'address', 'orders_count', 'created_at', 'updated_at'
        ]

    def get_orders_count(self, obj):
        return obj.orders.count()


# === ORDER SERIALIZERS ===
class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    menu_item_price = serializers.DecimalField(source='menu_item.price', max_digits=10, decimal_places=2, read_only=True)
    chair_number = serializers.CharField(source='chair.number', read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'menu_item', 'menu_item_name', 'menu_item_price',
            'quantity', 'unit_price', 'total_price', 'notes', 'status',
            'customizations', 'chair', 'chair_number', 'added_at', 'updated_at'
        ]


class OrderSerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True, read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    table_number = serializers.CharField(source='table.number', read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    waiter_name = serializers.CharField(source='waiter_assigned.name', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'restaurant', 'restaurant_name', 'table', 'table_number',
            'chair', 'customer', 'customer_name', 'status', 'order_type',
            'subtotal', 'tax', 'service_charge', 'discount', 'total',
            'payment_method', 'waiter_assigned', 'waiter_name', 'notes',
            'order_items', 'items_count', 'created_at', 'updated_at'
        ]

    def get_items_count(self, obj):
        return obj.order_items.count()


# === VENDOR SERIALIZERS ===
class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = [
            'id', 'name', 'type', 'email', 'phone', 'address', 'status',
            'rating', 'total_orders', 'revenue', 'commission',
            'delivery_radius', 'minimum_order', 'created_at', 'updated_at'
        ]


# === STAFF SERIALIZERS ===
class StaffSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    employee_email = serializers.CharField(source='employee.email', read_only=True)
    employee_phone = serializers.CharField(source='employee.phone', read_only=True)
    employee_role = serializers.CharField(source='employee.role', read_only=True)

    class Meta:
        model = Staff
        fields = [
            'id', 'employee', 'employee_name', 'employee_email', 'employee_phone',
            'employee_role', 'salary', 'status', 'shift', 'hire_date', 'avatar',
            'address', 'emergency_contact', 'performance_rating',
            'created_at', 'updated_at'
        ]


# === NOTIFICATION SERIALIZERS ===
class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'type', 'read', 'user', 'user_name',
            'restaurant', 'restaurant_name', 'action_url', 'created_at'
        ]


# === EXPENSE SERIALIZERS ===
class ExpenseSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    added_by_name = serializers.CharField(source='added_by.name', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'description', 'amount', 'category', 'restaurant', 'restaurant_name',
            'date', 'payment_method', 'receipt', 'recurring', 'approved',
            'added_by', 'added_by_name', 'created_at'
        ]


# === WASTE TRACKING SERIALIZERS ===
class WasteEntrySerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.name', read_only=True)

    class Meta:
        model = WasteEntry
        fields = [
            'id', 'item_name', 'quantity', 'unit', 'reason', 'estimated_cost',
            'restaurant', 'restaurant_name', 'date', 'reported_by', 'reported_by_name',
            'notes', 'created_at'
        ]


# === ANALYTICS SERIALIZERS ===
class AnalyticsSerializer(serializers.Serializer):
    """Serializer for analytics data"""
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_orders = serializers.IntegerField()
    average_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    revenue_growth = serializers.DecimalField(max_digits=5, decimal_places=2)
    order_growth = serializers.DecimalField(max_digits=5, decimal_places=2)
    customer_growth = serializers.DecimalField(max_digits=5, decimal_places=2)
    top_selling_items = MenuItemSerializer(many=True, read_only=True)
    daily_revenue = serializers.ListField(child=serializers.DictField())
    monthly_revenue = serializers.ListField(child=serializers.DictField())
