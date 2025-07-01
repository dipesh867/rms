import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

const AdminDashboard: React.FC = () => {
  const { theme, analytics, orders, notifications } = useApp();
  const navigate = useNavigate();

// Unified dashboard state
const [dashboardData, setDashboardData] = useState({
  system_health: {
    current: null as number | null,
    change: '0%'
  },
  restaurants: {
    total: 0,
    change: '0%'
  },
  users: {
    total: 0,
    active: 0,
    change: '0%'
  },
  vendors: {
    total: 0,
    change: '0%'
  },
  last_updated: 'Never'
});

const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);


// Unified dashboard data fetching
useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:8000/api/dashboard-stats/');
      const data = response.data;

      setDashboardData(data);

      console.log('Dashboard Data Updated:', {
        system_health: data.system_health.current,
        restaurants: data.restaurants.total,
        users: data.users.total,
        last_updated: data.last_updated
      });

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch immediately
  fetchDashboardData();

  // Set up interval to fetch every 30 seconds
  const interval = setInterval(fetchDashboardData, 30000);

  return () => clearInterval(interval);
}, []);

  // Helper function to determine change type
  const getChangeType = (change: string): 'positive' | 'negative' | 'neutral' => {
    if (change.startsWith('+')) return 'positive';
    if (change.startsWith('-')) return 'negative';
    return 'neutral';
  };

  // Admin stats cards using unified dashboard data
  const stats = [
    {
      title: 'Total Users',
      value: isLoading ? 'Loading...' : dashboardData.users.total.toString(),
      change: dashboardData.users.change,
      changeType: getChangeType(dashboardData.users.change),
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Active Restaurants',
      value: isLoading ? 'Loading...' : dashboardData.restaurants.total.toString(),
      change: dashboardData.restaurants.change,
      changeType: getChangeType(dashboardData.restaurants.change),
      icon: Store,
      color: 'secondary'
    },
    {
      title: 'Registered Vendors',
      value: isLoading ? 'Loading...' : dashboardData.vendors.total.toString(),
      change: dashboardData.vendors.change,
      changeType: getChangeType(dashboardData.vendors.change),
      icon: Package,
      color: 'accent'
    },
    {
      title: "System Health",
      value: isLoading
        ? 'Loading...'
        : dashboardData.system_health.current !== null
          ? `${dashboardData.system_health.current}%`
          : 'N/A',
      change: dashboardData.system_health.change,
      changeType: getChangeType(dashboardData.system_health.change),
      icon: CheckCircle,
      color: 'success'
    }
  ];

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

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-6">
        <div className={`p-6 rounded-xl border ${
          theme === 'dark'
            ? 'bg-red-900/20 border-red-800 text-red-300'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Dashboard Error</h3>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {!isLoading && dashboardData.last_updated !== 'Never' && (
              <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <p>Last updated: {new Date(dashboardData.last_updated).toLocaleTimeString()}</p>
                <p>Percentage changes compared to 1 week ago</p>
              </div>
            )}
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
        {stats.map((stat, index) => (
 <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}      
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          color={stat.color}
        />  
))}
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
