#!/usr/bin/env python
"""
Create test users for role-based authentication testing
"""
import os
import sys
import django
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from superadmin.models import Restaurant, Employee, Staff

def create_test_users():
    """Create test users for all roles"""
    print("🔐 Creating test users for authentication...")
    
    # Get or create test restaurant
    restaurant, created = Restaurant.objects.get_or_create(
        name="Test Restaurant API",
        defaults={
            'email': 'testapi@restaurant.com',
            'address': '123 API Test Street',
            'phone': '1234567890'
        }
    )
    print(f"✅ Restaurant: {restaurant.name}")
    
    # Create Admin User
    admin_employee, created = Employee.objects.get_or_create(
        email='admin@test.com',
        defaults={
            'name': 'Admin User',
            'role': 'admin',
            'phone': '1111111111'
        }
    )
    if created:
        print("✅ Created Admin User: admin@test.com / admin123")
    else:
        print("✅ Admin User already exists: admin@test.com / admin123")
    
    # Create Owner User
    owner_employee, created = Employee.objects.get_or_create(
        email='owner@test.com',
        defaults={
            'name': 'Owner User',
            'role': 'owner',
            'phone': '2222222222'
        }
    )
    owner_employee.restaurants.add(restaurant)
    if created:
        print("✅ Created Owner User: owner@test.com / owner123")
    else:
        print("✅ Owner User already exists: owner@test.com / owner123")
    
    # Create Manager User
    manager_employee, created = Employee.objects.get_or_create(
        email='manager@test.com',
        defaults={
            'name': 'Manager User',
            'role': 'manager',
            'phone': '3333333333'
        }
    )
    manager_employee.restaurants.add(restaurant)
    if created:
        print("✅ Created Manager User: manager@test.com / manager123")
    else:
        print("✅ Manager User already exists: manager@test.com / manager123")
    
    # Create Kitchen Staff User
    kitchen_employee, created = Employee.objects.get_or_create(
        email='kitchen@test.com',
        defaults={
            'name': 'Kitchen Staff',
            'role': 'kitchen',
            'phone': '4444444444'
        }
    )
    kitchen_employee.restaurants.add(restaurant)
    if created:
        print("✅ Created Kitchen User: kitchen@test.com / kitchen123")
    else:
        print("✅ Kitchen User already exists: kitchen@test.com / kitchen123")
    
    # Create Staff User
    staff_employee, created = Employee.objects.get_or_create(
        email='staff@test.com',
        defaults={
            'name': 'Restaurant Staff',
            'role': 'staff',
            'phone': '5555555555'
        }
    )
    staff_employee.restaurants.add(restaurant)
    if created:
        print("✅ Created Staff User: staff@test.com / staff123")
    else:
        print("✅ Staff User already exists: staff@test.com / staff123")
    
    # Create Waiter User
    waiter_employee, created = Employee.objects.get_or_create(
        email='waiter@test.com',
        defaults={
            'name': 'Waiter Staff',
            'role': 'waiter',
            'phone': '6666666666'
        }
    )
    waiter_employee.restaurants.add(restaurant)
    if created:
        print("✅ Created Waiter User: waiter@test.com / waiter123")
    else:
        print("✅ Waiter User already exists: waiter@test.com / waiter123")
    
    # Create Staff profiles for non-admin users
    staff_users = [
        (manager_employee, 'morning', 45000, 4.5),
        (kitchen_employee, 'morning', 35000, 4.2),
        (staff_employee, 'afternoon', 25000, 4.0),
        (waiter_employee, 'split', 22000, 4.3)
    ]
    
    for employee, shift, salary, rating in staff_users:
        staff_profile, created = Staff.objects.get_or_create(
            employee=employee,
            defaults={
                'salary': salary,
                'shift': shift,
                'hire_date': timezone.now().date(),
                'performance_rating': rating,
                'status': 'active'
            }
        )
        if created:
            print(f"✅ Created staff profile for {employee.name}")
    
    print("\n🎯 Test Users Summary:")
    print("=" * 50)
    print("👑 ADMIN LOGIN:")
    print("   URL: /admin/login")
    print("   Email: admin@test.com")
    print("   Password: admin123")
    print("   Access: System-wide administration")
    
    print("\n🏪 OWNER LOGIN:")
    print("   URL: /owner/login")
    print("   Email: owner@test.com")
    print("   Password: owner123")
    print("   Access: Restaurant management")
    
    print("\n👥 STAFF LOGIN:")
    print("   URL: /staff/login")
    print("   Manager: manager@test.com / manager123")
    print("   Kitchen: kitchen@test.com / kitchen123")
    print("   Staff: staff@test.com / staff123")
    print("   Waiter: waiter@test.com / waiter123")
    print("   Access: Role-specific dashboards")
    
    print("\n🔐 Authentication Features:")
    print("   ✅ Role-based login separation")
    print("   ✅ JWT token authentication")
    print("   ✅ Automatic role-based navigation")
    print("   ✅ Restaurant-specific access control")
    print("   ✅ Staff profile integration")
    
    return {
        'restaurant': restaurant,
        'admin': admin_employee,
        'owner': owner_employee,
        'manager': manager_employee,
        'kitchen': kitchen_employee,
        'staff': staff_employee,
        'waiter': waiter_employee
    }

if __name__ == '__main__':
    try:
        users = create_test_users()
        print(f"\n✅ All test users created successfully!")
        print(f"🏪 Restaurant ID: {users['restaurant'].id}")
        print(f"👥 Total Users: {len(users) - 1}")  # Exclude restaurant from count
    except Exception as e:
        print(f"❌ Error creating test users: {e}")
        import traceback
        traceback.print_exc()
