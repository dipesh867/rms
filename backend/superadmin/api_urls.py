"""
Comprehensive URL patterns for Restaurant Management System APIs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .api_views import (
    # Menu Management
    MenuCategoryListCreateView, MenuCategoryDetailView,
    MenuItemListCreateView, MenuItemDetailView,
    
    # Inventory Management
    InventoryCategoryListCreateView, InventoryItemListCreateView,
    InventoryItemDetailView, update_inventory_stock,
    
    # Table Management
    TableListCreateView, TableDetailView, update_table_status,
    
    # Customer Management
    CustomerListCreateView, CustomerDetailView,
    
    # Order Management
    OrderListCreateView, OrderDetailView, update_order_status,
    
    # Vendor Management
    VendorListCreateView, VendorDetailView,
    
    # Staff Management
    StaffListCreateView, StaffDetailView,
    
    # Notifications
    NotificationListView, mark_notification_read,
    
    # Expense Tracking
    ExpenseListCreateView, ExpenseDetailView,
    
    # Waste Tracking
    WasteEntryListCreateView, WasteEntryDetailView,
    
    # Analytics
    restaurant_analytics, inventory_alerts
)

urlpatterns = [
    # === MENU MANAGEMENT URLS ===
    path('menu/categories/', MenuCategoryListCreateView.as_view(), name='menu-categories'),
    path('menu/categories/<int:pk>/', MenuCategoryDetailView.as_view(), name='menu-category-detail'),
    path('menu/items/', MenuItemListCreateView.as_view(), name='menu-items'),
    path('menu/items/<int:pk>/', MenuItemDetailView.as_view(), name='menu-item-detail'),
    
    # === INVENTORY MANAGEMENT URLS ===
    path('inventory/categories/', InventoryCategoryListCreateView.as_view(), name='inventory-categories'),
    path('inventory/items/', InventoryItemListCreateView.as_view(), name='inventory-items'),
    path('inventory/items/<int:pk>/', InventoryItemDetailView.as_view(), name='inventory-item-detail'),
    path('inventory/items/<int:item_id>/update-stock/', update_inventory_stock, name='update-inventory-stock'),
    
    # === TABLE MANAGEMENT URLS ===
    path('tables/', TableListCreateView.as_view(), name='tables'),
    path('tables/<int:pk>/', TableDetailView.as_view(), name='table-detail'),
    path('tables/<int:table_id>/update-status/', update_table_status, name='update-table-status'),
    
    # === CUSTOMER MANAGEMENT URLS ===
    path('customers/', CustomerListCreateView.as_view(), name='customers'),
    path('customers/<int:pk>/', CustomerDetailView.as_view(), name='customer-detail'),
    
    # === ORDER MANAGEMENT URLS ===
    path('orders/', OrderListCreateView.as_view(), name='orders'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:order_id>/update-status/', update_order_status, name='update-order-status'),
    
    # === VENDOR MANAGEMENT URLS ===
    path('vendors/', VendorListCreateView.as_view(), name='vendors'),
    path('vendors/<int:pk>/', VendorDetailView.as_view(), name='vendor-detail'),
    
    # === STAFF MANAGEMENT URLS ===
    path('staff/', StaffListCreateView.as_view(), name='staff'),
    path('staff/<int:pk>/', StaffDetailView.as_view(), name='staff-detail'),
    
    # === NOTIFICATION URLS ===
    path('notifications/', NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:notification_id>/mark-read/', mark_notification_read, name='mark-notification-read'),
    
    # === EXPENSE TRACKING URLS ===
    path('expenses/', ExpenseListCreateView.as_view(), name='expenses'),
    path('expenses/<int:pk>/', ExpenseDetailView.as_view(), name='expense-detail'),
    
    # === WASTE TRACKING URLS ===
    path('waste/', WasteEntryListCreateView.as_view(), name='waste-entries'),
    path('waste/<int:pk>/', WasteEntryDetailView.as_view(), name='waste-entry-detail'),
    
    # === ANALYTICS URLS ===
    path('analytics/restaurant/<int:restaurant_id>/', restaurant_analytics, name='restaurant-analytics'),
    path('analytics/inventory-alerts/<int:restaurant_id>/', inventory_alerts, name='inventory-alerts'),
]
