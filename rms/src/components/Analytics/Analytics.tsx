import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Clock,
  Star
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import StatsCard from '../Common/StatsCard';
import RevenueChart from '../Charts/RevenueChart';

const Analytics: React.FC = () => {
  const { theme, analytics, orders, customers } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const metrics = [
    { value: 'revenue', label: 'Revenue', icon: DollarSign },
    { value: 'orders', label: 'Orders', icon: ShoppingCart },
    { value: 'customers', label: 'Customers', icon: Users },
    { value: 'performance', label: 'Performance', icon: Target }
  ];

  const topItems = [
    { name: 'Margherita Pizza', sales: 245, revenue: 6127.55, growth: 12.5 },
    { name: 'Caesar Salad', sales: 189, revenue: 3586.11, growth: 8.2 },
    { name: 'Grilled Salmon', sales: 156, revenue: 5142.44, growth: 15.3 },
    { name: 'Beef Burger', sales: 142, revenue: 3834.58, growth: -2.1 },
    { name: 'Pasta Carbonara', sales: 128, revenue: 3200.00, growth: 5.7 }
  ];

  const customerMetrics = [
    { label: 'New Customers', value: '1,234', change: '+23%', type: 'positive' },
    { label: 'Returning Customers', value: '5,678', change: '+12%', type: 'positive' },
    { label: 'Customer Retention', value: '78%', change: '+5%', type: 'positive' },
    { label: 'Avg. Visit Frequency', value: '2.3x', change: '+0.2', type: 'positive' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Analytics & Reports
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive business insights and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          change={`+${analytics.revenueGrowth}%`}
          changeType="positive"
          icon={DollarSign}
          color="primary"
        />
        <StatsCard
          title="Total Orders"
          value={analytics.totalOrders.toLocaleString()}
          change={`+${analytics.orderGrowth}%`}
          changeType="positive"
          icon={ShoppingCart}
          color="secondary"
        />
        <StatsCard
          title="Avg Order Value"
          value={`$${analytics.averageOrderValue.toFixed(2)}`}
          change="+$3.20"
          changeType="positive"
          icon={Target}
          color="accent"
        />
        <StatsCard
          title="Customer Growth"
          value={`+${analytics.customerGrowth}%`}
          change="vs last period"
          changeType="positive"
          icon={Users}
          color="success"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Revenue Trends
            </h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-success-500" />
              <span className="text-success-500 font-medium">+{analytics.revenueGrowth}%</span>
            </div>
          </div>
          <RevenueChart data={analytics.dailyRevenue} />
        </div>

        {/* Top Selling Items */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Top Selling Items
          </h3>
          <div className="space-y-4">
            {topItems.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.sales} sold
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${item.revenue.toLocaleString()}
                  </p>
                  <p className={`text-sm ${
                    item.growth > 0 ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {item.growth > 0 ? '+' : ''}{item.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Analytics */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Customer Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {customerMetrics.map((metric, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {metric.label}
                </span>
                <span className={`text-sm font-medium ${
                  metric.type === 'positive' ? 'text-success-600' : 'text-error-600'
                }`}>
                  {metric.change}
                </span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Average Order Time
          </h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                18.5 min
              </p>
              <p className="text-sm text-success-600">-2.3 min vs last week</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Customer Satisfaction
          </h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                4.8/5
              </p>
              <p className="text-sm text-success-600">+0.2 vs last month</p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Revenue per Customer
          </h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                $67.95
              </p>
              <p className="text-sm text-success-600">+$4.20 vs last month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;