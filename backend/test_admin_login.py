#!/usr/bin/env python
"""
Test admin login and get token for frontend testing
"""
import requests
import json

def test_admin_login():
    print("Testing Admin Login...")
    
    # Admin login data
    login_data = {
        "email": "testadmin@test.com",
        "password": "admin123"
    }
    
    try:
        # Make login request
        response = requests.post(
            'http://localhost:8000/api/superadmin/auth/admin/login/',
            json=login_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Login successful!")
            print(f"Access Token: {data.get('access_token', 'Not found')}")
            print(f"User: {data.get('user', {}).get('name', 'Unknown')} ({data.get('user', {}).get('role', 'Unknown')})")
            return data.get('access_token')
        else:
            print(f"❌ Login failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_restaurant_creation(token):
    if not token:
        print("❌ No token available for restaurant creation test")
        return
        
    print("\nTesting Restaurant Creation...")
    
    # Restaurant data
    restaurant_data = {
        "name": "Frontend Test Restaurant",
        "email": "frontendtest@restaurant.com",
        "address": "123 Frontend Street",
        "phone": "555-0500",
        "owner": {
            "name": "Frontend Test Owner",
            "email": "frontendtestowner@test.com",
            "password": "testpass123"
        }
    }
    
    try:
        # Make restaurant creation request
        response = requests.post(
            'http://localhost:8000/api/superadmin/restaurants/',
            json=restaurant_data,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {token}'
            }
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print(f"✅ Restaurant created successfully!")
        else:
            print(f"❌ Restaurant creation failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    token = test_admin_login()
    test_restaurant_creation(token)
    print("\nTest completed!")
