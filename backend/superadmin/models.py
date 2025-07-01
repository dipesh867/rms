from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings


# class UserManager(BaseUserManager):
#     def create_user(self, email, password=None, **extra_fields):
#         if not email:
#             raise ValueError("Email is required")
#         email = self.normalize_email(email)
#         user = self.model(email=email, **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_superuser(self, email, password=None, **extra_fields):
#         extra_fields.setdefault('is_superuser', True)
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('status', 'active')

#         if not extra_fields.get('is_superuser'):
#             raise ValueError('Superuser must have is_superuser=True.')
#         if not extra_fields.get('is_staff'):
#             raise ValueError('Superuser must have is_staff=True.')

#         return self.create_user(email, password, **extra_fields)


# class User(AbstractUser):
#     ROLE_CHOICES = [
#         ('admin', 'System Administrator'),   # Superuser from createsuperuser
#         ('owner', 'Restaurant Owner'),       # Login via owner portal only
#         ('vendor', 'Vendor Partner'),
#         ('kitchen', 'Kitchen Staff'),
#         ('staff', 'Restaurant Staff'),       # Login via staff portal only
#         ('manager', 'Restaurant Manager'),   # Login via manager portal only
#     ]

#     DEPARTMENT_CHOICES = [
#         ('IT', 'IT'),
#         ('Support', 'Support'),
#         ('Sales', 'Sales'),
#         ('HR', 'Human Resources'),
#         ('Finance', 'Finance'),
#         ('Operations', 'Operations'),
#         ('Management', 'Management'),
#     ]

#     STATUS_CHOICES = [
#         ('active', 'Active'),
#         ('inactive', 'Inactive'),
#     ]

#     username = None  # Remove username
#     email = models.EmailField(unique=True)
#     name = models.CharField(max_length=255, blank=True) 
#     phone = models.CharField(max_length=10,null=True,blank=True)
#     role = models.CharField(max_length=20, choices=ROLE_CHOICES)
#     department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES, blank=True, null=True)
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
#     recent_activity = models.TextField(blank=True, null=True)

#     USERNAME_FIELD = 'email'
#     REQUIRED_FIELDS = []  # Only asks for email + password in createsuperuser

#     objects = UserManager()

#     def __str__(self):
#         return f"{self.email} ({self.role})"
    


class Restaurant(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.name


class Employee(models.Model):
    ROLE_CHOICES = [
        ('owner','Owner'),
        ('manager', 'Manager'),
        ('kitchen_staff', 'Kitchen Staff'),
        ('resturant_staff', 'Resturant Staff')
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    restaurants = models.ManyToManyField(Restaurant, related_name='employees')
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - {self.role}"


class DailyStats(models.Model):
    """Model to store daily statistics for weekly comparison"""
    date = models.DateField(unique=True)
    restaurant_count = models.IntegerField(default=0)
    employee_count = models.IntegerField(default=0)
    vendor_count = models.IntegerField(default=0)
    system_health_avg = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Daily Statistics'
        verbose_name_plural = 'Daily Statistics'

    def __str__(self):
        return f"Stats for {self.date}: {self.restaurant_count} restaurants, {self.employee_count} employees"


# === MENU MANAGEMENT MODELS ===
class MenuCategory(models.Model):
    """Categories for menu items"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_categories')
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        unique_together = ['restaurant', 'name']

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


class MenuItem(models.Model):
    """Menu items for restaurants"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name='items')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    image_url = models.URLField(blank=True, null=True)
    available = models.BooleanField(default=True)
    preparation_time = models.IntegerField(default=15, help_text="Time in minutes")
    allergens = models.JSONField(default=list, blank=True)
    ingredients = models.JSONField(default=list, blank=True)
    calories = models.IntegerField(null=True, blank=True)
    is_vegan = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


# === INVENTORY MANAGEMENT MODELS ===
class InventoryCategory(models.Model):
    """Categories for inventory items"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='inventory_categories')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['restaurant', 'name']
        verbose_name_plural = 'Inventory Categories'

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


class InventoryItem(models.Model):
    """Inventory items for restaurants"""
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('l', 'Liter'),
        ('ml', 'Milliliter'),
        ('pcs', 'Pieces'),
        ('dozen', 'Dozen'),
        ('pack', 'Pack'),
        ('bottle', 'Bottle'),
        ('can', 'Can'),
        ('box', 'Box'),
    ]

    STATUS_CHOICES = [
        ('in-stock', 'In Stock'),
        ('low-stock', 'Low Stock'),
        ('out-of-stock', 'Out of Stock'),
        ('expired', 'Expired'),
    ]

    name = models.CharField(max_length=200)
    category = models.ForeignKey(InventoryCategory, on_delete=models.CASCADE, related_name='items')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='inventory_items')
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    max_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=200, blank=True)
    last_restocked = models.DateTimeField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    barcode = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in-stock')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        unique_together = ['restaurant', 'name']

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

    def update_status(self):
        """Update status based on current stock levels"""
        if self.current_stock <= 0:
            self.status = 'out-of-stock'
        elif self.current_stock <= self.min_stock:
            self.status = 'low-stock'
        else:
            self.status = 'in-stock'
        self.save()


# === TABLE MANAGEMENT MODELS ===
class Table(models.Model):
    """Tables in restaurants"""
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('cleaning', 'Cleaning'),
    ]

    SHAPE_CHOICES = [
        ('rectangle', 'Rectangle'),
        ('circle', 'Circle'),
        ('square', 'Square'),
    ]

    number = models.CharField(max_length=20)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tables')
    capacity = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    section = models.CharField(max_length=100, default='Main')
    qr_code = models.CharField(max_length=200, blank=True)
    waiter_assigned = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tables')
    reservation_time = models.DateTimeField(null=True, blank=True)
    shape = models.CharField(max_length=20, choices=SHAPE_CHOICES, default='rectangle')
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['number']
        unique_together = ['restaurant', 'number']

    def __str__(self):
        return f"{self.restaurant.name} - Table {self.number}"


class Chair(models.Model):
    """Chairs for tables (for individual ordering)"""
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('cleaning', 'Cleaning'),
    ]

    number = models.CharField(max_length=10)
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='chairs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    customer_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['number']
        unique_together = ['table', 'number']

    def __str__(self):
        return f"{self.table} - Chair {self.number}"


# === CUSTOMER MANAGEMENT MODELS ===
class Customer(models.Model):
    """Customer information"""
    MEMBERSHIP_CHOICES = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='customers')
    loyalty_points = models.IntegerField(default=0)
    total_orders = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_visit = models.DateTimeField(null=True, blank=True)
    membership_tier = models.CharField(max_length=20, choices=MEMBERSHIP_CHOICES, default='bronze')
    preferred_payment_method = models.CharField(max_length=50, blank=True)
    dietary_restrictions = models.JSONField(default=list, blank=True)
    birthday = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-total_spent']

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"


# === ORDER MANAGEMENT MODELS ===
class Order(models.Model):
    """Orders placed by customers"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('payment-pending', 'Payment Pending'),
    ]

    ORDER_TYPE_CHOICES = [
        ('dine-in', 'Dine In'),
        ('takeaway', 'Takeaway'),
        ('delivery', 'Delivery'),
        ('room-service', 'Room Service'),
    ]

    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
        ('credit', 'Credit'),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    chair = models.ForeignKey(Chair, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='dine-in')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True)
    waiter_assigned = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_orders')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.restaurant.name}"

    def calculate_total(self):
        """Calculate order total"""
        self.subtotal = sum(item.quantity * item.unit_price for item in self.order_items.all())
        self.total = self.subtotal + self.tax + self.service_charge - self.discount
        self.save()


class OrderItem(models.Model):
    """Individual items in an order"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.IntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    customizations = models.JSONField(default=list, blank=True)
    chair = models.ForeignKey(Chair, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['added_at']

    def __str__(self):
        return f"{self.menu_item.name} x{self.quantity} - Order #{self.order.pk}"

    @property
    def total_price(self):
        return self.quantity * self.unit_price


# === VENDOR MANAGEMENT MODELS ===
class Vendor(models.Model):
    """External vendors/suppliers"""
    TYPE_CHOICES = [
        ('restaurant', 'Restaurant'),
        ('hotel', 'Hotel'),
        ('cafe', 'Cafe'),
        ('bar', 'Bar'),
        ('supplier', 'Supplier'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending-approval', 'Pending Approval'),
    ]

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending-approval')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    total_orders = models.IntegerField(default=0)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    commission = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    delivery_radius = models.IntegerField(null=True, blank=True, help_text="Delivery radius in km")
    minimum_order = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


# === STAFF MANAGEMENT MODELS ===
class Staff(models.Model):
    """Staff members (extends Employee with additional fields)"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('on-leave', 'On Leave'),
    ]

    SHIFT_CHOICES = [
        ('morning', 'Morning'),
        ('afternoon', 'Afternoon'),
        ('night', 'Night'),
        ('split', 'Split'),
    ]

    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='staff_profile')
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='morning')
    hire_date = models.DateField()
    avatar = models.URLField(blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    performance_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['employee__name']

    def __str__(self):
        return f"{self.employee.name} - {self.employee.role}"


# === NOTIFICATION MODELS ===
class Notification(models.Model):
    """System notifications"""
    TYPE_CHOICES = [
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    ]

    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    read = models.BooleanField(default=False)
    user = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    action_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.type}"


# === EXPENSE TRACKING MODELS ===
class Expense(models.Model):
    """Business expenses"""
    CATEGORY_CHOICES = [
        ('utilities', 'Utilities'),
        ('supplies', 'Supplies'),
        ('staff', 'Staff'),
        ('marketing', 'Marketing'),
        ('maintenance', 'Maintenance'),
        ('other', 'Other'),
    ]

    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='expenses')
    date = models.DateField()
    payment_method = models.CharField(max_length=50)
    receipt = models.URLField(blank=True)
    recurring = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)
    added_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='added_expenses')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.description} - ${self.amount}"


# === WASTE TRACKING MODELS ===
class WasteEntry(models.Model):
    """Food waste tracking"""
    REASON_CHOICES = [
        ('expired', 'Expired'),
        ('damaged', 'Damaged'),
        ('overcooked', 'Overcooked'),
        ('customer-return', 'Customer Return'),
        ('other', 'Other'),
    ]

    item_name = models.CharField(max_length=200)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=20)
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='waste_entries')
    date = models.DateField()
    reported_by = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='reported_waste')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.item_name} - {self.quantity} {self.unit}"

