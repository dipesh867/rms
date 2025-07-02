"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

@csrf_exempt
def dashboard_stats_view(request):
    """Simple dashboard stats endpoint"""
    try:
        # Import models inside the function to avoid import issues
        from superadmin.models import Restaurant, Employee, Vendor

        # Get current counts
        total_restaurants = Restaurant.objects.count()
        total_employees = Employee.objects.count()
        total_vendors = Vendor.objects.count()

        # Calculate week-over-week changes
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)

        restaurants_week_ago = Restaurant.objects.filter(created_at__lt=week_ago).count()
        employees_week_ago = Employee.objects.filter(created_at__lt=week_ago).count()
        vendors_week_ago = Vendor.objects.filter(created_at__lt=week_ago).count()

        # Calculate percentage changes
        restaurant_change = ((total_restaurants - restaurants_week_ago) / max(restaurants_week_ago, 1)) * 100 if restaurants_week_ago > 0 else 0
        employee_change = ((total_employees - employees_week_ago) / max(employees_week_ago, 1)) * 100 if employees_week_ago > 0 else 0
        vendor_change = ((total_vendors - vendors_week_ago) / max(vendors_week_ago, 1)) * 100 if vendors_week_ago > 0 else 0

        return JsonResponse({
            'system_health': {
                'current': 99.5,
                'change': '+0.2%'
            },
            'restaurants': {
                'total': total_restaurants,
                'change': f'{restaurant_change:+.1f}%' if restaurant_change != 0 else '0%'
            },
            'users': {
                'total': total_employees,
                'active': total_employees,
                'change': f'{employee_change:+.1f}%' if employee_change != 0 else '0%'
            },
            'vendors': {
                'total': total_vendors,
                'change': f'{vendor_change:+.1f}%' if vendor_change != 0 else '0%'
            },
            'last_updated': timezone.now().isoformat(),
            'debug_info': {
                'restaurants_week_ago': restaurants_week_ago,
                'employees_week_ago': employees_week_ago,
                'vendors_week_ago': vendors_week_ago,
                'restaurant_change_calc': restaurant_change,
                'employee_change_calc': employee_change
            }
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'system_health': {'current': 0, 'change': '0%'},
            'restaurants': {'total': 0, 'change': '0%'},
            'users': {'total': 0, 'active': 0, 'change': '0%'},
            'vendors': {'total': 0, 'change': '0%'},
            'last_updated': timezone.now().isoformat()
        })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/dashboard-stats/', dashboard_stats_view, name='dashboard-stats'),
    path('api/superadmin/', include('superadmin.urls')),
    path('api/owner/', include('owner_dashboard.urls')),
    path('api/kitchen/', include('kitchen_dashboard.urls')),
    path('api/staff/', include('staff_dashboard.urls')),
    path('api/vendor/', include('vendor_dashboard.urls')),
]
