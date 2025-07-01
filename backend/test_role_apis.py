#!/usr/bin/env python
"""
Test script for role-based dashboard APIs
"""
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from superadmin.models import (
    Restaurant, Employee, MenuCategory, MenuItem, InventoryCategory, 
    InventoryItem, Table, Chair, Customer, Order, OrderItem, 
    Vendor, Staff, Notification
)

def create_test_data():
    """Create comprehensive test data for all roles"""
    print("🏗️ Creating test data...")
    
    # Get or create restaurant
    restaurant, created = Restaurant.objects.get_or_create(
        name="Test Restaurant API",
        defaults={
            'email': 'testapi@restaurant.com',
            'address': '123 API Test Street',
            'phone': '1234567890'
        }
    )
    print(f"✅ Restaurant: {restaurant.name}")
    
    # Create employees for different roles
    admin_employee, created = Employee.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'name': 'Admin User',
            'role': 'admin',
            'phone': '1111111111'
        }
    )
    admin_employee.restaurants.add(restaurant)
    
    owner_employee, created = Employee.objects.get_or_create(
        email='owner@test.com',
        defaults={
            'name': 'Owner User',
            'role': 'owner',
            'phone': '2222222222'
        }
    )
    owner_employee.restaurants.add(restaurant)
    
    manager_employee, created = Employee.objects.get_or_create(
        email='manager@test.com',
        defaults={
            'name': 'Manager User',
            'role': 'manager',
            'phone': '3333333333'
        }
    )
    manager_employee.restaurants.add(restaurant)
    
    kitchen_employee, created = Employee.objects.get_or_create(
        email='kitchen@test.com',
        defaults={
            'name': 'Kitchen Staff',
            'role': 'kitchen',
            'phone': '4444444444'
        }
    )
    kitchen_employee.restaurants.add(restaurant)
    
    staff_employee, created = Employee.objects.get_or_create(
        email='staff@test.com',
        defaults={
            'name': 'Restaurant Staff',
            'role': 'staff',
            'phone': '5555555555'
        }
    )
    staff_employee.restaurants.add(restaurant)
    
    print(f"✅ Created employees for all roles")
    
    # Create staff profiles
    Staff.objects.get_or_create(
        employee=kitchen_employee,
        defaults={
            'salary': 30000,
            'shift': 'morning',
            'hire_date': timezone.now().date(),
            'performance_rating': 4.5
        }
    )
    
    Staff.objects.get_or_create(
        employee=staff_employee,
        defaults={
            'salary': 25000,
            'shift': 'afternoon',
            'hire_date': timezone.now().date(),
            'performance_rating': 4.2
        }
    )
    
    # Create menu categories and items
    category, created = MenuCategory.objects.get_or_create(
        name='Main Course',
        restaurant=restaurant,
        defaults={'description': 'Main course items'}
    )
    
    MenuItem.objects.get_or_create(
        name='Grilled Chicken',
        restaurant=restaurant,
        category=category,
        defaults={
            'description': 'Delicious grilled chicken',
            'price': 15.99,
            'preparation_time': 20,
            'available': True
        }
    )
    
    MenuItem.objects.get_or_create(
        name='Pasta Carbonara',
        restaurant=restaurant,
        category=category,
        defaults={
            'description': 'Creamy pasta with bacon',
            'price': 12.99,
            'preparation_time': 15,
            'available': True
        }
    )
    
    # Create inventory
    inv_category, created = InventoryCategory.objects.get_or_create(
        name='Meat',
        restaurant=restaurant
    )
    
    InventoryItem.objects.get_or_create(
        name='Chicken Breast',
        restaurant=restaurant,
        category=inv_category,
        defaults={
            'current_stock': 50,
            'min_stock': 10,
            'max_stock': 100,
            'unit': 'kg',
            'cost_per_unit': 8.50,
            'supplier': 'Fresh Meat Co'
        }
    )
    
    # Create tables
    table1, created = Table.objects.get_or_create(
        number='T1',
        restaurant=restaurant,
        defaults={
            'capacity': 4,
            'section': 'Main Hall',
            'waiter_assigned': staff_employee
        }
    )
    
    table2, created = Table.objects.get_or_create(
        number='T2',
        restaurant=restaurant,
        defaults={
            'capacity': 2,
            'section': 'Main Hall',
            'status': 'occupied'
        }
    )
    
    # Create chairs for tables
    Chair.objects.get_or_create(
        number='1',
        table=table1,
        defaults={'status': 'available'}
    )
    
    Chair.objects.get_or_create(
        number='2',
        table=table1,
        defaults={'status': 'available'}
    )
    
    # Create customers
    customer, created = Customer.objects.get_or_create(
        name='John Doe',
        restaurant=restaurant,
        defaults={
            'email': 'john@example.com',
            'phone': '9999999999',
            'loyalty_points': 150,
            'membership_tier': 'gold',
            'total_spent': 250.50
        }
    )
    
    # Create orders
    order, created = Order.objects.get_or_create(
        restaurant=restaurant,
        table=table2,
        customer=customer,
        defaults={
            'status': 'active',
            'order_type': 'dine-in',
            'subtotal': 28.98,
            'tax': 2.32,
            'total': 31.30,
            'waiter_assigned': staff_employee
        }
    )
    
    # Create order items
    menu_item = MenuItem.objects.filter(restaurant=restaurant).first()
    if menu_item:
        OrderItem.objects.get_or_create(
            order=order,
            menu_item=menu_item,
            defaults={
                'quantity': 2,
                'unit_price': menu_item.price,
                'status': 'preparing',
                'notes': 'Extra spicy'
            }
        )
    
    # Create vendors
    Vendor.objects.get_or_create(
        name='Fresh Supplies Co',
        defaults={
            'type': 'supplier',
            'email': 'contact@freshsupplies.com',
            'phone': '7777777777',
            'address': '456 Supplier Street',
            'status': 'active',
            'rating': 4.3,
            'commission': 5.0,
            'delivery_radius': 25
        }
    )
    
    # Create notifications
    Notification.objects.get_or_create(
        title='Low Stock Alert',
        restaurant=restaurant,
        defaults={
            'message': 'Chicken breast is running low',
            'type': 'warning',
            'read': False
        }
    )
    
    print("✅ Test data created successfully!")
    return restaurant.id

def test_apis():
    """Test all role-based APIs"""
    print("\n🧪 Testing Role-Based APIs...")
    
    restaurant_id = create_test_data()
    
    # Import here to avoid circular imports
    from superadmin.role_based_views import (
        admin_dashboard_stats, owner_dashboard_stats, 
        manager_dashboard_stats, kitchen_dashboard_stats
    )
    from superadmin.staff_apis import (
        staff_dashboard_stats, real_time_restaurant_status
    )
    
    # Mock request object
    class MockUser:
        def __init__(self, email):
            self.email = email
    
    class MockRequest:
        def __init__(self, user_email):
            self.user = MockUser(user_email)
    
    # Test Admin Dashboard
    print("\n📊 Testing Admin Dashboard...")
    try:
        admin_request = MockRequest('admin@test.com')
        response = admin_dashboard_stats(admin_request)
        if response.status_code == 200:
            print("✅ Admin Dashboard API working")
            data = response.data
            print(f"   - Total Restaurants: {data['overview']['total_restaurants']}")
            print(f"   - Total Employees: {data['overview']['total_employees']}")
        else:
            print(f"❌ Admin Dashboard failed: {response.data}")
    except Exception as e:
        print(f"❌ Admin Dashboard error: {e}")
    
    # Test Owner Dashboard
    print("\n🏪 Testing Owner Dashboard...")
    try:
        owner_request = MockRequest('owner@test.com')
        response = owner_dashboard_stats(owner_request, restaurant_id)
        if response.status_code == 200:
            print("✅ Owner Dashboard API working")
            data = response.data
            print(f"   - Today's Revenue: ${data['overview']['today_revenue']}")
            print(f"   - Active Orders: {data['overview']['active_orders']}")
        else:
            print(f"❌ Owner Dashboard failed: {response.data}")
    except Exception as e:
        print(f"❌ Owner Dashboard error: {e}")
    
    # Test Manager Dashboard
    print("\n👔 Testing Manager Dashboard...")
    try:
        manager_request = MockRequest('manager@test.com')
        response = manager_dashboard_stats(manager_request, restaurant_id)
        if response.status_code == 200:
            print("✅ Manager Dashboard API working")
            data = response.data
            print(f"   - Active Orders: {data['real_time']['active_orders']}")
            print(f"   - Total Tables: {data['tables']['total']}")
        else:
            print(f"❌ Manager Dashboard failed: {response.data}")
    except Exception as e:
        print(f"❌ Manager Dashboard error: {e}")
    
    # Test Kitchen Dashboard
    print("\n👨‍🍳 Testing Kitchen Dashboard...")
    try:
        kitchen_request = MockRequest('kitchen@test.com')
        response = kitchen_dashboard_stats(kitchen_request, restaurant_id)
        if response.status_code == 200:
            print("✅ Kitchen Dashboard API working")
            data = response.data
            print(f"   - Pending Items: {len(data['queue']['pending'])}")
            print(f"   - Preparing Items: {len(data['queue']['preparing'])}")
        else:
            print(f"❌ Kitchen Dashboard failed: {response.data}")
    except Exception as e:
        print(f"❌ Kitchen Dashboard error: {e}")
    
    # Test Real-time Status
    print("\n⚡ Testing Real-time Status...")
    try:
        realtime_request = MockRequest('manager@test.com')
        response = real_time_restaurant_status(realtime_request, restaurant_id)
        if response.status_code == 200:
            print("✅ Real-time Status API working")
            data = response.data
            print(f"   - Active Orders: {data['orders']['active']}")
            print(f"   - Staff on Duty: {data['staff_on_duty']}")
        else:
            print(f"❌ Real-time Status failed: {response.data}")
    except Exception as e:
        print(f"❌ Real-time Status error: {e}")
    
    print("\n🎉 API Testing Complete!")

if __name__ == '__main__':
    test_apis()
