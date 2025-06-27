import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Package,
  Utensils,
  Star,
  Calendar,
  Target,
  BarChart3,
  Activity,
  Zap,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Plus,
  PieChart,
  ListChecks,
  Bell
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

const ManagerDashboard: React.FC = () => {
  const { theme, analytics, orders, tables, staff, inventory, customers } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [realTimeData, setRealTimeData] = useState({
    activeOrders: 0,
    todayRevenue: 0,
    customersServed: 0,
    avgOrderTime: 0,
    tableOccupancy: 0,
    staffOnDuty: 0
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const activeOrders = orders.filter(o => o.status === 'active').length;
      const occupiedTables = tables.filter(t => t.status === 'occupied').length;
      const activeStaff = staff.filter(s => s.status === 'active').length;
      
      setRealTimeData({
        activeOrders,
        todayRevenue: 12450 + Math.floor(Math.random() * 1000),
        customersServed: 142 + Math.floor(Math.random() * 10),
        avgOrderTime: 18 + Math.floor(Math.random() * 5),
        tableOccupancy: Math.round((occupiedTables / tables.length) * 100),
        staffOnDuty: activeStaff
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [orders, tables, staff]);

  const kpiCards = [
    {
      title: "Today's Revenue",
      value: `$${realTimeData.todayRevenue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'primary',
      target: '$15,000',
      progress: (realTimeData.todayRevenue / 15000) * 100
    },
    {
      title: 'Active Orders',
      value: realTimeData.activeOrders.toString(),
      change: '+3',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'secondary',
      target: '25',
      progress: (realTimeData.activeOrders / 25) * 100
    },
    {
      title: 'Customers Today',
      value: realTimeData.customersServed.toString(),
      change: '+8.3%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'accent',
      target: '200',
      progress: (realTimeData.customersServed / 200) * 100
    },
    {
      title: 'Table Occupancy',
      value: `${realTimeData.tableOccupancy}%`,
      change: '+5%',
      changeType: 'positive' as const,
      icon: Utensils,
      color: 'success',
      target: '100%',
      progress: realTimeData.tableOccupancy
    }
  ];

  const operationalMetrics = [
    {
      title: 'Avg Order Time',
      value: `${realTimeData.avgOrderTime}min`,
      target: '20min',
      status: realTimeData.avgOrderTime <= 20 ? 'good' : 'warning',
      icon: Clock
    },
    {
      title: 'Staff on Duty',
      value: `${realTimeData.staffOnDuty}/${staff.length}`,
      target: `${staff.length}`,
      status: realTimeData.staffOnDuty >= staff.length * 0.8 ? 'good' : 'warning',
      icon: Users
    },
    {
      title: 'Low Stock Items',
      value: inventory.filter(i => i.status === 'low-stock').length.toString(),
      target: '0',
      status: inventory.filter(i => i.status === 'low-stock').length === 0 ? 'good' : 'alert',
      icon: Package
    },
    {
      title: 'Customer Rating',
      value: '4.8/5',
      target: '4.5/5',
      status: 'good',
      icon: Star
    }
  ];

  const recentActivities = [
    { time: '2 min ago', action: 'New order #1234 received', type: 'order', icon: ShoppingCart },
    { time: '5 min ago', action: 'Table A3 cleaned and ready', type: 'table', icon: Utensils },
    { time: '8 min ago', action: 'Staff member John clocked in', type: 'staff', icon: Users },
    { time: '12 min ago', action: 'Payment processed for order #1230', type: 'payment', icon: DollarSign },
    { time: '15 min ago', action: 'Inventory alert: Low stock on Tomatoes', type: 'alert', icon: AlertTriangle }
  ];

  const quickActions = [
    { title: 'New Order', description: 'Create manual order', icon: ShoppingCart, color: 'bg-blue-500', action: 'pos' },
    { title: 'Table Status', description: 'View & manage tables', icon: Utensils, color: 'bg-green-500', action: 'tables' },
    { title: 'Staff Schedule', description: 'Check staff status', icon: Users, color: 'bg-purple-500', action: 'staff' },
    { title: 'Inventory Check', description: 'View stock levels', icon: Package, color: 'bg-orange-500', action: 'inventory' },
    { title: 'Reports', description: 'Generate reports', icon: BarChart3, color: 'bg-red-500', action: 'reports' },
    { title: 'Settings', description: 'Restaurant settings', icon: Target, color: 'bg-gray-500', action: 'settings' }
  ];

  // Performance metrics for the chart
  const performanceData = [
    { day: 'Mon', orders: 152, revenue: 8250 },
    { day: 'Tue', orders: 178, revenue: 9400 },
    { day: 'Wed', orders: 195, revenue: 10800 },
    { day: 'Thu', orders: 210, revenue: 11500 },
    { day: 'Fri', orders: 230, revenue: 13200 },
    { day: 'Sat', orders: 260, revenue: 15800 },
    { day: 'Sun', orders: 245, revenue: 14300 }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Restaurant Dashboard
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete restaurant management & operations control
          </p>
          <div className="flex items-center flex-wrap gap-4 mt-2">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                System Online
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary-500" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Real-time Updates
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-warning-500" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                3 New Alerts
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Quick Actions</span>
          </button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden`}>
              {/* Progress Bar Background */}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-1000"
                style={{ width: `${Math.min(kpi.progress, 100)}%` }}
              ></div>
              
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br from-${kpi.color}-500 to-${kpi.color}-600 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
                  <ArrowUp className="w-4 h-4" />
                  <span>{kpi.change}</span>
                </div>
              </div>
              
              <div>
                <h3 className={`text-3xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                } group-hover:scale-105 transition-transform duration-200`}>
                  {kpi.value}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {kpi.title}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Target: {kpi.target}
                  </span>
                  <span className={`text-xs font-medium ${
                    kpi.progress >= 80 ? 'text-success-600' : 
                    kpi.progress >= 60 ? 'text-warning-600' : 'text-error-600'
                  }`}>
                    {Math.round(kpi.progress)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Metrics & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operational Metrics */}
        <div className={`lg:col-span-2 p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Operational Metrics
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {operationalMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                } hover:scale-105 transition-transform duration-200`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon className={`w-5 h-5 ${
                      metric.status === 'good' ? 'text-success-500' :
                      metric.status === 'warning' ? 'text-warning-500' : 'text-error-500'
                    }`} />
                    <div className={`w-2 h-2 rounded-full ${
                      metric.status === 'good' ? 'bg-success-500' :
                      metric.status === 'warning' ? 'bg-warning-500' : 'bg-error-500'
                    }`}></div>
                  </div>
                  <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {metric.value}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {metric.title}
                  </div>
                  <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    Target: {metric.target}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mini Chart */}
          <div className="mt-6 p-4 bg-gray-700/50 dark:bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Weekly Performance
              </h4>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Orders</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                  <span className="text-xs text-gray-400">Revenue</span>
                </div>
              </div>
            </div>
            
            <div className="h-36 bg-gray-800 dark:bg-gray-800/50 rounded-lg relative">
              {/* Simplified chart visualization */}
              <div className="absolute inset-0 flex items-end justify-between p-2">
                {performanceData.map((item, i) => (
                  <div key={i} className="flex flex-col items-center h-full justify-end">
                    <div 
                      className="w-4 bg-success-500 rounded-t-sm"
                      style={{ height: `${(item.revenue/16000) * 100}%` }}
                    ></div>
                    <div 
                      className="w-4 bg-primary-500 rounded-t-sm mt-1"
                      style={{ height: `${(item.orders/300) * 100}%` }}
                    ></div>
                    <span className="mt-1 text-xs text-gray-400">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  className={`p-4 rounded-lg ${action.color} hover:scale-105 transition-all duration-200 group text-white`}
                >
                  <Icon className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </button>
              );
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 bg-gray-700/50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className={`font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Today's Highlights
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 bg-gray-800/50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Best Selling</div>
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Margherita Pizza
                </div>
                <div className="text-xs text-success-500 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  <span>32 sold</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 p-3 bg-gray-800/50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-gray-400">Most Profitable</div>
                <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Wine Bottles
                </div>
                <div className="text-xs text-success-500 flex items-center gap-1">
                  <ArrowUp className="w-3 h-3" />
                  <span>82% margin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Live Activity Feed
            </h3>
            <div className="flex items-center text-primary-500 text-sm">
              <span>View all</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                } hover:scale-105 transition-transform duration-200`}>
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'table' ? 'bg-green-100 text-green-600' :
                    activity.type === 'staff' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'payment' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {activity.action}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Business Insights */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Business Insights
            </h3>
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary-500" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Sales Breakdown
                  </span>
                </div>
                <span className="text-xs text-primary-500">Today</span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Dine-in</span>
                  <span className="text-xs font-medium">{Math.floor(Math.random() * 60) + 40}%</span>
                  <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{width: '65%'}}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Takeaway</span>
                  <span className="text-xs font-medium">{Math.floor(Math.random() * 30) + 20}%</span>
                  <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary-500 rounded-full" style={{width: '25%'}}></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Delivery</span>
                  <span className="text-xs font-medium">{Math.floor(Math.random() * 20) + 10}%</span>
                  <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-warning-500 rounded-full" style={{width: '10%'}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-warning-500" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Pending Tasks
                  </span>
                </div>
                <span className="text-xs text-warning-500">3 urgent</span>
              </div>
              <ul className="mt-3 space-y-2">
                <li className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-error-500 rounded-full"></div>
                  <span className="text-gray-400">Reorder tomatoes from supplier</span>
                </li>
                <li className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-warning-500 rounded-full"></div>
                  <span className="text-gray-400">Approve staff schedule for next week</span>
                </li>
                <li className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-warning-500 rounded-full"></div>
                  <span className="text-gray-400">Confirm weekend reservations</span>
                </li>
                <li className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">Review new menu items</span>
                </li>
              </ul>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent-500" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Peak Hours
                  </span>
                </div>
                <span className="text-xs text-accent-500">Today</span>
              </div>
              <div className="mt-3">
                <div className="h-12 relative w-full bg-gray-800/30 dark:bg-gray-800 rounded overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-accent-500/20" style={{width: '30%'}}></div>
                  <div className="absolute top-0 left-[30%] h-full bg-accent-500/50" style={{width: '15%'}}></div>
                  <div className="absolute top-0 left-[45%] h-full bg-accent-500" style={{width: '25%'}}></div>
                  <div className="absolute top-0 left-[70%] h-full bg-accent-500/50" style={{width: '20%'}}></div>
                  <div className="absolute top-0 left-[90%] h-full bg-accent-500/20" style={{width: '10%'}}></div>
                  {/* Time labels */}
                  <div className="absolute bottom-0 left-0 w-full flex justify-between px-2 text-[9px] text-gray-400">
                    <span>10am</span>
                    <span>12pm</span>
                    <span>2pm</span>
                    <span>4pm</span>
                    <span>6pm</span>
                    <span>8pm</span>
                    <span>10pm</span>
                  </div>
                </div>
                <div className="mt-2 text-center text-xs text-gray-400">
                  Peak hours: 12pm-2pm & 6pm-8pm
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success-500" />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Growth Indicators
                  </span>
                </div>
                <span className="text-xs text-success-500">vs. Last Week</span>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Revenue</span>
                  <span className="text-xs text-success-500">+12.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Orders</span>
                  <span className="text-xs text-success-500">+8.3%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Avg Order Value</span>
                  <span className="text-xs text-success-500">+3.7%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">Customer Retention</span>
                  <span className="text-xs text-warning-500">-1.2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Priority Alerts & Notifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-warning-50 border border-warning-200 dark:bg-warning-900/20 dark:border-warning-800">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-warning-600" />
              <div>
                <h4 className="font-medium text-warning-800 dark:text-warning-400">Low Stock Alert</h4>
                <p className="text-sm text-warning-600 dark:text-warning-500">3 items need restocking</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-400">Peak Hours Approaching</h4>
                <p className="text-sm text-blue-600 dark:text-blue-500">Lunch rush starts in 30 min</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-success-50 border border-success-200 dark:bg-success-900/20 dark:border-success-800">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-success-600" />
              <div>
                <h4 className="font-medium text-success-800 dark:text-success-400">Daily Target Achieved</h4>
                <p className="text-sm text-success-600 dark:text-success-500">Revenue goal reached!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;