#!/usr/bin/env python
"""
Test script for restaurant creation API
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from superadmin.serializers import RestaurantSerializer
from superadmin.models import Restaurant, Employee, User
from django.test import RequestFactory
from superadmin.views import RestaurantCreateView
from rest_framework.test import force_authenticate

def test_restaurant_creation():
    print("Testing Restaurant Creation API...")
    
    # Test data
    data = {
        'name': 'API Test Restaurant',
        'email': 'apitest2@restaurant.com',
        'address': '789 API Avenue',
        'phone': '555-0301',
        'owner': {
            'name': 'API Test Owner',
            'email': 'apitestowner2@test.com',
            'password': 'testpass123'
        }
    }
    
    print(f"Data to create: {data}")
    
    # Test serializer
    serializer = RestaurantSerializer(data=data)
    print(f"Validating data...")
    
    is_valid = serializer.is_valid()
    print(f"Valid: {is_valid}")
    
    if is_valid:
        try:
            restaurant = serializer.save()
            print(f"✅ SUCCESS: Restaurant and owner created!")
            print(f"   Restaurant: {restaurant.name} ({restaurant.email})")
            
            # Check if owner was created
            owner = Employee.objects.filter(email=data['owner']['email']).first()
            if owner:
                print(f"   Owner: {owner.name} ({owner.email}) - Role: {owner.role}")
                print(f"   Owner linked to restaurants: {[r.name for r in owner.restaurants.all()]}")
            else:
                print("   ❌ Owner not found!")
                
        except Exception as e:
            print(f"❌ ERROR during creation: {e}")
    else:
        print(f"❌ VALIDATION ERRORS: {serializer.errors}")

def test_existing_data():
    print("\n" + "="*50)
    print("EXISTING DATA:")
    print("="*50)
    
    print("\nRestaurants:")
    for r in Restaurant.objects.all():
        print(f"  - {r.name} ({r.email})")
    
    print("\nEmployees:")
    for e in Employee.objects.all():
        restaurants = [r.name for r in e.restaurants.all()]
        print(f"  - {e.name} ({e.email}) - {e.role} - Restaurants: {restaurants}")

def test_admin_permission():
    print("\n" + "="*50)
    print("TESTING ADMIN PERMISSION:")
    print("="*50)

    # Create or get admin user
    admin_user, created = User.objects.get_or_create(
        email='testadmin@test.com',
        defaults={
            'name': 'Test Admin',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"✅ Created admin user: {admin_user.email}")
    else:
        print(f"✅ Using existing admin user: {admin_user.email}")

    # Test data
    data = {
        'name': 'Admin Test Restaurant',
        'email': 'admintest@restaurant.com',
        'address': '999 Admin Street',
        'phone': '555-0400',
        'owner': {
            'name': 'Admin Test Owner',
            'email': 'admintestowner@test.com',
            'password': 'testpass123'
        }
    }

    # Create request factory
    factory = RequestFactory()
    request = factory.post('/api/superadmin/restaurants/', data, format='json')

    # Create view instance
    view = RestaurantCreateView()
    view.request = request

    # Authenticate request with admin user
    force_authenticate(request, user=admin_user)

    try:
        # Test serializer with admin permission
        serializer = RestaurantSerializer(data=data)
        if serializer.is_valid():
            # This should work since user is admin
            restaurant = serializer.save()
            print(f"✅ SUCCESS: Admin can create restaurant: {restaurant.name}")
        else:
            print(f"❌ Validation failed: {serializer.errors}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_existing_data()
    test_restaurant_creation()
    test_admin_permission()
    print("\n" + "="*50)
    print("All tests completed!")
