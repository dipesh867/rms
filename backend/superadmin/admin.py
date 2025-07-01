from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Restaurant, Employee, DailyStats, MenuCategory, MenuItem,
    InventoryCategory, InventoryItem, Table, Chair, Customer,
    Order, OrderItem, Vendor, Staff, Notification, Expense, WasteEntry
)


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone', 'role', 'department', 'status', 'is_staff')
    list_filter = ('role', 'department', 'status', 'is_staff')
    search_fields = ('username', 'email', 'phone')
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Roles/Permissions', {
            'fields': ('role', 'department', 'status', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
        ('Activity', {'fields': ('recent_activity',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'phone', 'role', 'department'),
        }),
    )


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'email', 'phone')
    ordering = ('name',)


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'phone', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('name', 'email', 'phone')
    ordering = ('name',)
    filter_horizontal = ('restaurants',)


@admin.register(DailyStats)
class DailyStatsAdmin(admin.ModelAdmin):
    list_display = ('date', 'restaurant_count', 'employee_count', 'vendor_count', 'system_health_avg')
    list_filter = ('date',)
    ordering = ('-date',)
    readonly_fields = ('created_at', 'updated_at')


# === MENU MANAGEMENT ADMIN ===
@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'display_order', 'is_active', 'created_at')
    list_filter = ('restaurant', 'is_active')
    search_fields = ('name', 'description')
    ordering = ('restaurant', 'display_order')


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'category', 'price', 'available', 'created_at')
    list_filter = ('restaurant', 'category', 'available', 'is_vegan', 'is_gluten_free')
    search_fields = ('name', 'description')
    ordering = ('restaurant', 'category', 'name')


# === INVENTORY MANAGEMENT ADMIN ===
@admin.register(InventoryCategory)
class InventoryCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'created_at')
    list_filter = ('restaurant',)
    search_fields = ('name', 'description')


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'category', 'current_stock', 'min_stock', 'status', 'updated_at')
    list_filter = ('restaurant', 'category', 'status', 'unit')
    search_fields = ('name', 'supplier', 'barcode')
    ordering = ('restaurant', 'category', 'name')


# === TABLE MANAGEMENT ADMIN ===
@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ('number', 'restaurant', 'capacity', 'status', 'section', 'waiter_assigned')
    list_filter = ('restaurant', 'status', 'section')
    search_fields = ('number', 'section')
    ordering = ('restaurant', 'number')


@admin.register(Chair)
class ChairAdmin(admin.ModelAdmin):
    list_display = ('number', 'table', 'status', 'customer_name')
    list_filter = ('table__restaurant', 'status')
    search_fields = ('number', 'customer_name')


# === CUSTOMER MANAGEMENT ADMIN ===
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'email', 'phone', 'membership_tier', 'total_spent', 'last_visit')
    list_filter = ('restaurant', 'membership_tier')
    search_fields = ('name', 'email', 'phone')
    ordering = ('restaurant', '-total_spent')


# === ORDER MANAGEMENT ADMIN ===
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'restaurant', 'table', 'customer', 'status', 'total', 'created_at')
    list_filter = ('restaurant', 'status', 'order_type', 'created_at')
    search_fields = ('customer__name', 'notes')
    ordering = ('-created_at',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('menu_item', 'order', 'quantity', 'unit_price', 'status')
    list_filter = ('order__restaurant', 'status', 'menu_item__category')
    search_fields = ('menu_item__name', 'notes')


# === VENDOR MANAGEMENT ADMIN ===
@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'email', 'status', 'rating', 'total_orders', 'revenue')
    list_filter = ('type', 'status')
    search_fields = ('name', 'email', 'address')
    ordering = ('name',)


# === STAFF MANAGEMENT ADMIN ===
@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('employee', 'salary', 'status', 'shift', 'hire_date', 'performance_rating')
    list_filter = ('status', 'shift', 'employee__role')
    search_fields = ('employee__name', 'employee__email')
    ordering = ('employee__name',)


# === NOTIFICATION ADMIN ===
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'user', 'restaurant', 'read', 'created_at')
    list_filter = ('type', 'read', 'restaurant', 'created_at')
    search_fields = ('title', 'message')
    ordering = ('-created_at',)


# === EXPENSE TRACKING ADMIN ===
@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('description', 'restaurant', 'amount', 'category', 'date', 'approved', 'added_by')
    list_filter = ('restaurant', 'category', 'approved', 'recurring', 'date')
    search_fields = ('description', 'payment_method')
    ordering = ('-date',)


# === WASTE TRACKING ADMIN ===
@admin.register(WasteEntry)
class WasteEntryAdmin(admin.ModelAdmin):
    list_display = ('item_name', 'restaurant', 'quantity', 'unit', 'reason', 'estimated_cost', 'date')
    list_filter = ('restaurant', 'reason', 'date')
    search_fields = ('item_name', 'notes')
    ordering = ('-date',)

# @admin.register(SystemAlert)
# class SystemAlertAdmin(admin.ModelAdmin):
#     list_display = ('alert_type', 'truncated_message', 'created_at', 'is_read')
#     list_filter = ('alert_type', 'is_read')
#     search_fields = ('message',)
#     date_hierarchy = 'created_at'
#     actions = ['mark_as_read']
    
#     def truncated_message(self, obj):
#         return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
#     truncated_message.short_description = 'Message'
    
#     def mark_as_read(self, request, queryset):
#         queryset.update(is_read=True)
#     mark_as_read.short_description = "Mark selected alerts as read"

# @admin.register(ActivityLog)
# class ActivityLogAdmin(admin.ModelAdmin):
#     list_display = ('action', 'actor', 'timestamp', 'truncated_description')
#     list_filter = ('timestamp',)
#     search_fields = ('action', 'description', 'actor__username')
#     date_hierarchy = 'timestamp'
#     readonly_fields = ('actor', 'action', 'timestamp', 'description')
    
#     def truncated_description(self, obj):
#         return obj.description[:75] + '...' if obj.description and len(obj.description) > 75 else obj.description
#     truncated_description.short_description = 'Description'

# admin.site.register(User, CustomUserAdmin)