"""
Vendor Dashboard Views
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from superadmin.models import Vendor


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def vendor_dashboard_stats(request, vendor_id):
    """Vendor dashboard statistics"""
    try:
        vendor = Vendor.objects.get(id=vendor_id)

        return Response({
            'vendor': {
                'id': vendor.pk,
                'name': vendor.name,
                'email': vendor.email
            },
            'message': 'Vendor dashboard endpoint working',
            'timestamp': timezone.now().isoformat()
        })

    except Vendor.DoesNotExist:
        return Response({
            'error': 'Vendor not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': f'Failed to fetch vendor dashboard: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
