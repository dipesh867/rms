/**
 * Protected Route Component with Django API Integration
 */
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthAPI } from '../../hooks/useAuthAPI';
import { Loader } from 'lucide-react';

interface ProtectedRouteAPIProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

const ProtectedRouteAPI: React.FC<ProtectedRouteAPIProps> = ({ 
  children, 
  allowedRoles = [],
  redirectTo = '/admin/login'
}) => {
  const { user, isLoading, isAuthenticated, verifyToken } = useAuthAPI();
  const [isVerifying, setIsVerifying] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        const isValid = await verifyToken();
        if (!isValid) {
          setIsVerifying(false);
          return;
        }
      }
      setIsVerifying(false);
    };

    checkAuth();
  }, [isAuthenticated, verifyToken]);

  // Show loading spinner while checking authentication
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirects = {
      admin: '/admin',
      owner: '/owner',
      manager: '/manager',
      kitchen: '/kitchen',
      staff: '/staff',
      waiter: '/staff'
    };

    const userRedirect = roleRedirects[user.role as keyof typeof roleRedirects] || '/admin/login';
    return <Navigate to={userRedirect} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRouteAPI;
