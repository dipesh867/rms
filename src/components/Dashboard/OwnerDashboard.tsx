import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock,
  Utensils,
  Star,
  Package
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import StatsCard from '../Common/StatsCard';
import RevenueChart from '../Charts/RevenueChart';

const OwnerDashboard: React.FC = () => {
  const { theme, analytics, orders, tables, customers, inventory } = useApp();

  const todayRevenue = 4200; // Mock data for today
  const todayOrders = 47;
  const activeOrders = orders.filter(o => o.status === 'active').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const lowStockItems = inventory.filter(i => i.status === 'low-stock').length;

  const stats = [
    {
      title: "Today's Revenue",
      value: `$${todayRevenue.toLocaleString()}`,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'primary'
    },
    {
      title: "Today's Orders",
      value: todayOrders.toString(),
      change: '+8.3%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'secondary'
    },
    {
      title: 'Active Orders',
      value: activeOrders.toString(),
      change: `${activeOrders} pending`,
      changeType: 'neutral' as const,
      icon: Clock,
      color: 'warning'
    },
    {
      title: 'Occupied Tables',
      value: `${occupiedTables}/${tables.length}`,
      change: `${Math.round((occupiedTables / tables.length) * 100)}% capacity`,
      changeType: 'neutral' as const,
      icon: Utensils,
      color: 'accent'
    }
  ];

  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className={`lg:col-span-2 p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Revenue Trends (Last 7 Days)
            </h3>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-success-500" />
              <span className="text-success-500 font-medium">+12.5%</span>
            </div>
          </div>
          <RevenueChart data={analytics.dailyRevenue} />
        </div>

        {/* Quick Actions */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
              <ShoppingCart className="w-4 h-4" />
              <span>New Order</span>
            </button>
            <button className={`w-full p-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}>
              <Utensils className="w-4 h-4" />
              <span>Manage Tables</span>
            </button>
            <button className={`w-full p-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}>
              <Package className="w-4 h-4" />
              <span>Check Inventory</span>
            </button>
          </div>

          {/* Alerts */}
          {lowStockItems > 0 && (
            <div className="mt-4 p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-warning-600" />
                <span className="text-warning-800 font-medium">
                  {lowStockItems} items low in stock
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Recent Orders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentOrders.map((order) => (
            <div key={order.id} className={`p-4 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Order #{order.id}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'completed'
                    ? 'bg-success-100 text-success-800'
                    : order.status === 'active'
                    ? 'bg-warning-100 text-warning-800'
                    : 'bg-error-100 text-error-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Table: {order.tableId || 'Takeaway'}
              </p>
              <p className={`text-sm mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Items: {order.items.length}
              </p>
              <div className="flex items-center justify-between">
                <span className={`font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${order.total.toFixed(2)}
                </span>
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {order.createdAt.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;