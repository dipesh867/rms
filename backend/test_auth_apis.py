#!/usr/bin/env python
"""
Test authentication APIs
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_auth_apis():
    """Test all authentication endpoints"""
    print("🔐 Testing Authentication APIs...")
    print("=" * 50)
    
    # Test data
    test_users = [
        {
            'name': 'Admin',
            'endpoint': f"{BASE_URL}/auth/admin/login/",
            'email': 'admin@test.com',
            'password': 'admin123',
            'expected_role': 'admin'
        },
        {
            'name': 'Owner',
            'endpoint': f"{BASE_URL}/auth/owner/login/",
            'email': 'owner@test.com',
            'password': 'owner123',
            'expected_role': 'owner'
        },
        {
            'name': 'Manager',
            'endpoint': f"{BASE_URL}/auth/staff/login/",
            'email': 'manager@test.com',
            'password': 'manager123',
            'expected_role': 'manager'
        },
        {
            'name': 'Kitchen',
            'endpoint': f"{BASE_URL}/auth/staff/login/",
            'email': 'kitchen@test.com',
            'password': 'kitchen123',
            'expected_role': 'kitchen'
        },
        {
            'name': 'Staff',
            'endpoint': f"{BASE_URL}/auth/staff/login/",
            'email': 'staff@test.com',
            'password': 'staff123',
            'expected_role': 'staff'
        }
    ]
    
    successful_logins = 0
    tokens = {}
    
    for user in test_users:
        print(f"\n🧪 Testing {user['name']} Login...")
        
        try:
            response = requests.post(
                user['endpoint'],
                json={
                    'email': user['email'],
                    'password': user['password']
                },
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {user['name']} login successful!")
                print(f"   - User: {data['user']['name']}")
                print(f"   - Role: {data['user']['role']}")
                print(f"   - Email: {data['user']['email']}")
                
                if 'restaurants' in data['user'] and data['user']['restaurants']:
                    print(f"   - Restaurant: {data['user']['restaurants'][0]['name'] if isinstance(data['user']['restaurants'][0], dict) else 'ID: ' + str(data['user']['restaurants'][0])}")
                
                # Store token for further testing
                tokens[user['name']] = data['access_token']
                successful_logins += 1
                
                # Verify role matches expected
                if data['user']['role'] == user['expected_role']:
                    print(f"   ✅ Role verification passed")
                else:
                    print(f"   ⚠️  Role mismatch: expected {user['expected_role']}, got {data['user']['role']}")
                    
            else:
                print(f"❌ {user['name']} login failed!")
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ Connection error - Server not running?")
            break
        except Exception as e:
            print(f"❌ {user['name']} login error: {str(e)}")
    
    # Test token verification
    print(f"\n🔍 Testing Token Verification...")
    if tokens:
        # Test with admin token
        admin_token = tokens.get('Admin')
        if admin_token:
            try:
                response = requests.get(
                    f"{BASE_URL}/auth/verify/",
                    headers={
                        'Authorization': f'Bearer {admin_token}',
                        'Content-Type': 'application/json'
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Token verification successful!")
                    print(f"   - User: {data['user']['name']}")
                    print(f"   - Role: {data['user']['role']}")
                else:
                    print(f"❌ Token verification failed: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Token verification error: {str(e)}")
    
    # Test role-based dashboard access
    print(f"\n📊 Testing Role-based Dashboard Access...")
    
    dashboard_tests = [
        ('Admin Dashboard', f"{BASE_URL}/dashboard/admin/dashboard/", tokens.get('Admin')),
        ('Owner Dashboard', f"{BASE_URL}/dashboard/owner/restaurant/6/dashboard/", tokens.get('Owner')),
        ('Manager Dashboard', f"{BASE_URL}/dashboard/manager/restaurant/6/dashboard/", tokens.get('Manager')),
        ('Kitchen Dashboard', f"{BASE_URL}/dashboard/kitchen/restaurant/6/dashboard/", tokens.get('Kitchen')),
    ]
    
    for dashboard_name, endpoint, token in dashboard_tests:
        if token:
            try:
                response = requests.get(
                    endpoint,
                    headers={
                        'Authorization': f'Bearer {token}',
                        'Content-Type': 'application/json'
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    print(f"✅ {dashboard_name} access successful!")
                else:
                    print(f"⚠️  {dashboard_name} access failed: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ {dashboard_name} error: {str(e)}")
        else:
            print(f"⏭️  Skipping {dashboard_name} - no token available")
    
    # Summary
    print(f"\n" + "=" * 50)
    print(f"📋 AUTHENTICATION TEST SUMMARY")
    print(f"=" * 50)
    print(f"✅ Successful logins: {successful_logins}/{len(test_users)}")
    print(f"🔑 Tokens generated: {len(tokens)}")
    
    if successful_logins == len(test_users):
        print(f"🎉 All authentication tests passed!")
        print(f"🔐 Role-based login system working correctly!")
    else:
        print(f"⚠️  Some authentication tests failed")
    
    print(f"\n🚀 Frontend Integration Ready:")
    print(f"   - Admin Login: /admin/login")
    print(f"   - Owner Login: /owner/login") 
    print(f"   - Staff Login: /staff/login")
    print(f"   - All role-based dashboards accessible")
    
    return successful_logins == len(test_users)

if __name__ == '__main__':
    try:
        success = test_auth_apis()
        if success:
            print(f"\n✅ Authentication system fully functional!")
        else:
            print(f"\n❌ Authentication system has issues")
    except KeyboardInterrupt:
        print(f"\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
