import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Store,
  Package,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import StatsCard from '../Common/StatsCard';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, DashboardStats } from '../../services/api';

const AdminDashboard: React.FC = () => {
  const { theme, analytics, orders, notifications } = useApp();
  const navigate = useNavigate();
  
  // Admin-specific stats
  const [adminStats, setAdminStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch admin stats from Django backend
    const fetchAdminStats = async () => {
      try {
        setIsLoading(true);
        const stats = await dashboardAPI.getStats();
        setAdminStats(stats);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Set default values on error
        setAdminStats({
          system_health: { current: 0, change: '0%' },
          restaurants: { total: 0, change: '0%' },
          users: { total: 0, active: 0, change: '0%' },
          vendors: { total: 0, change: '0%' },
          last_updated: new Date().toISOString()
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  // Admin stats cards
  const stats = adminStats ? [
    {
      title: 'Total Users',
      value: adminStats.users.total.toString(),
      change: adminStats.users.change,
      changeType: adminStats.users.change.startsWith('+') ? 'positive' as const : 'negative' as const,
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Active Restaurants',
      value: adminStats.restaurants.total.toString(),
      change: adminStats.restaurants.change,
      changeType: adminStats.restaurants.change.startsWith('+') ? 'positive' as const : 'negative' as const,
      icon: Store,
      color: 'secondary'
    },
    {
      title: 'Registered Vendors',
      value: adminStats.vendors.total.toString(),
      change: adminStats.vendors.change,
      changeType: adminStats.vendors.change.startsWith('+') ? 'positive' as const : 'negative' as const,
      icon: Package,
      color: 'accent'
    },
    {
      title: 'System Health',
      value: `${adminStats.system_health.current}%`,
      change: adminStats.system_health.change,
      changeType: adminStats.system_health.change.startsWith('+') ? 'positive' as const : 'negative' as const,
      icon: CheckCircle,
      color: 'success'
    }
  ] : [];

  // Admin quick actions
  const quickActions = [
    { 
      title: 'Register Restaurant', 
      description: 'Create a new restaurant and owner account',
      action: () => navigate('/register-restaurant'),
      icon: Store,
      color: 'bg-primary-500'
    },
    { 
      title: 'Manage Users', 
      description: 'View and manage system users',
      action: () => navigate('/admin/users'),
      icon: Users,
      color: 'bg-blue-500'
    },
    { 
      title: 'Manage Vendors', 
      description: 'Approve and manage vendors',
      action: () => navigate('/admin/vendors'),
      icon: Package,
      color: 'bg-green-500'
    }
  ];

  const criticalAlerts = notifications.filter(n => n.type === 'warning' || n.type === 'error').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Welcome to the Admin Dashboard
            </h1>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage your entire restaurant network from one central location
            </p>
          </div>
          <button
            onClick={() => navigate('/register-restaurant')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Register New Restaurant
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`p-6 rounded-xl animate-pulse ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`h-4 w-20 rounded mb-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-8 w-16 rounded mb-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-3 w-12 rounded ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                </div>
                <div className={`w-12 h-12 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}></div>
              </div>
            </div>
          ))
        ) : (
          stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))
        )}
      </div>

      {/* Quick Actions and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className={`lg:col-span-2 p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className={`p-6 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${action.color}`}>
                  {React.createElement(action.icon, { className: 'text-white w-6 h-6' })}
                </div>
                <h4 className={`font-semibold text-base mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {action.title}
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {action.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Alerts */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            System Alerts
          </h3>
          <div className="space-y-3">
            {criticalAlerts.length > 0 ? (
              criticalAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg ${
                  alert.type === 'error' 
                    ? 'bg-error-50 border border-error-200 dark:bg-error-900/20 dark:border-error-800' 
                    : 'bg-warning-50 border border-warning-200 dark:bg-warning-900/20 dark:border-warning-800'
                }`}>
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                      alert.type === 'error' ? 'text-error-500' : 'text-warning-500'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${
                        alert.type === 'error' ? 'text-error-800 dark:text-error-300' : 'text-warning-800 dark:text-warning-300'
                      }`}>
                        {alert.title}
                      </h4>
                      <p className={`text-sm ${
                        alert.type === 'error' ? 'text-error-600 dark:text-error-400' : 'text-warning-600 dark:text-warning-400'
                      }`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3" />
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  All Systems Operational
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No critical alerts at this time
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Recent System Activity
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Action
                </th>
                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  User
                </th>
                <th className={`text-left py-3 px-4 font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  New restaurant registered
                </td>
                <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  System Admin
                </td>
                <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  2 hours ago
                </td>
              </tr>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  New user account created
                </td>
                <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  System Admin
                </td>
                <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  5 hours ago
                </td>
              </tr>
              <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  System update deployed
                </td>
                <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  System
                </td>
                <td className={`py-3 px-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  1 day ago
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;