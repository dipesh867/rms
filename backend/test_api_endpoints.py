#!/usr/bin/env python
"""
Test API endpoints using HTTP requests
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_endpoints():
    """Test all API endpoints"""
    print("🧪 Testing API Endpoints...")
    
    # Test endpoints that don't require authentication
    endpoints = [
        # Admin Dashboard (public for testing)
        f"{BASE_URL}/dashboard/admin/dashboard/",
        
        # Basic API endpoints
        f"{BASE_URL}/api/menu/categories/",
        f"{BASE_URL}/api/inventory/items/",
        f"{BASE_URL}/api/tables/",
        f"{BASE_URL}/api/orders/",
        f"{BASE_URL}/api/customers/",
        f"{BASE_URL}/api/vendors/",
        f"{BASE_URL}/api/staff/",
        f"{BASE_URL}/api/expenses/",
        f"{BASE_URL}/api/waste/",
        
        # Analytics endpoints
        f"{BASE_URL}/api/analytics/restaurant/1/",
        f"{BASE_URL}/api/analytics/inventory-alerts/1/",
    ]
    
    print(f"\n📡 Testing {len(endpoints)} endpoints...")
    
    for endpoint in endpoints:
        try:
            print(f"\n🔍 Testing: {endpoint}")
            response = requests.get(endpoint, timeout=10)
            
            if response.status_code == 200:
                print(f"✅ SUCCESS - Status: {response.status_code}")
                try:
                    data = response.json()
                    if isinstance(data, dict):
                        print(f"   📊 Response keys: {list(data.keys())}")
                    elif isinstance(data, list):
                        print(f"   📋 Response: List with {len(data)} items")
                except:
                    print(f"   📄 Response: {response.text[:100]}...")
            else:
                print(f"⚠️  WARNING - Status: {response.status_code}")
                print(f"   📄 Response: {response.text[:200]}...")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ CONNECTION ERROR - Server not running?")
            break
        except requests.exceptions.Timeout:
            print(f"⏰ TIMEOUT - Endpoint took too long")
        except Exception as e:
            print(f"❌ ERROR - {str(e)}")
    
    print("\n🎉 Endpoint Testing Complete!")

def test_dashboard_functionality():
    """Test dashboard-specific functionality"""
    print("\n📊 Testing Dashboard Functionality...")
    
    # Test admin dashboard
    try:
        response = requests.get(f"{BASE_URL}/dashboard/admin/dashboard/")
        if response.status_code == 200:
            data = response.json()
            print("✅ Admin Dashboard Working:")
            print(f"   - Total Restaurants: {data['overview']['total_restaurants']}")
            print(f"   - Total Employees: {data['overview']['total_employees']}")
            print(f"   - Total Vendors: {data['overview']['total_vendors']}")
            print(f"   - Today's Revenue: ${data['overview']['today_revenue']}")
            
            if data['top_restaurants']:
                print(f"   - Top Restaurant: {data['top_restaurants'][0]['name']}")
            
            print(f"   - Low Stock Alerts: {data['alerts']['low_stock_items']}")
            print(f"   - Pending Vendor Approvals: {data['alerts']['pending_vendor_approvals']}")
        else:
            print(f"❌ Admin Dashboard Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Admin Dashboard Error: {e}")

def test_crud_operations():
    """Test CRUD operations on various endpoints"""
    print("\n🔧 Testing CRUD Operations...")
    
    # Test creating a menu category
    try:
        category_data = {
            "name": "Test Category API",
            "description": "Created via API test",
            "restaurant": 1,
            "display_order": 1,
            "is_active": True
        }
        
        response = requests.post(
            f"{BASE_URL}/api/menu/categories/",
            json=category_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            print("✅ Menu Category Created Successfully")
            created_category = response.json()
            print(f"   - ID: {created_category.get('id')}")
            print(f"   - Name: {created_category.get('name')}")
        else:
            print(f"⚠️  Menu Category Creation Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Menu Category Creation Error: {e}")
    
    # Test creating a vendor
    try:
        vendor_data = {
            "name": "Test Vendor API",
            "type": "supplier",
            "email": "testvendor@api.com",
            "phone": "1234567890",
            "address": "123 API Test Street",
            "status": "active",
            "rating": 4.5,
            "commission": 5.0
        }
        
        response = requests.post(
            f"{BASE_URL}/api/vendors/",
            json=vendor_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 201:
            print("✅ Vendor Created Successfully")
            created_vendor = response.json()
            print(f"   - ID: {created_vendor.get('id')}")
            print(f"   - Name: {created_vendor.get('name')}")
        else:
            print(f"⚠️  Vendor Creation Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Vendor Creation Error: {e}")

def main():
    """Main test function"""
    print("🚀 Starting Comprehensive API Testing...")
    print("=" * 50)
    
    # Test basic endpoints
    test_endpoints()
    
    # Test dashboard functionality
    test_dashboard_functionality()
    
    # Test CRUD operations
    test_crud_operations()
    
    print("\n" + "=" * 50)
    print("🏁 All Tests Complete!")

if __name__ == '__main__':
    main()
