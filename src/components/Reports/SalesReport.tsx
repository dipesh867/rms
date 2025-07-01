import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingCart, 
  Calendar, 
  Download, 
  Printer,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  Users,
  CreditCard,
  Package,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { LineChart, Line, BarChart, Bar, PieChart as RechartPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReportFilters {
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  paymentMethods: string[];
  categories: string[];
  compareWithPrevious: boolean;
}

interface SalesSummary {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  growth: number;
}

interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

interface CategorySales {
  category: string;
  sales: number;
  percentage: number;
}

interface PaymentMethodSummary {
  method: string;
  amount: number;
  count: number;
}

interface TopSellingItem {
  id: string;
  name: string;
  quantity: number;
  revenue: number;
  growth: number;
}

const SalesReport: React.FC = () => {
  const { theme } = useApp();
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'week',
    startDate: undefined,
    endDate: undefined,
    paymentMethods: [],
    categories: [],
    compareWithPrevious: true
  });

  // Mock data
  const salesSummary: SalesSummary = {
    totalSales: 24580.50,
    totalOrders: 385,
    averageOrderValue: 63.85,
    growth: 12.5
  };

  const dailySales: DailySales[] = [
    { date: '2025-04-01', sales: 3245.75, orders: 54 },
    { date: '2025-04-02', sales: 2980.25, orders: 48 },
    { date: '2025-04-03', sales: 3520.50, orders: 62 },
    { date: '2025-04-04', sales: 4280.00, orders: 75 },
    { date: '2025-04-05', sales: 4850.75, orders: 80 },
    { date: '2025-04-06', sales: 3250.25, orders: 45 },
    { date: '2025-04-07', sales: 2453.00, orders: 41 }
  ];

  const categorySales: CategorySales[] = [
    { category: 'Main Course', sales: 10250.50, percentage: 41.7 },
    { category: 'Beverages', sales: 5430.25, percentage: 22.1 },
    { category: 'Desserts', sales: 4120.75, percentage: 16.8 },
    { category: 'Appetizers', sales: 3650.00, percentage: 14.8 },
    { category: 'Sides', sales: 1130.00, percentage: 4.6 }
  ];

  const paymentMethods: PaymentMethodSummary[] = [
    { method: 'Credit Card', amount: 12850.50, count: 198 },
    { method: 'Cash', amount: 6540.25, count: 102 },
    { method: 'Digital Wallet', amount: 3250.75, count: 54 },
    { method: 'UPI', amount: 1940.00, count: 31 }
  ];

  const topSellingItems: TopSellingItem[] = [
    { id: '1', name: 'Margherita Pizza', quantity: 87, revenue: 2168.13, growth: 15.3 },
    { id: '2', name: 'Grilled Salmon', quantity: 54, revenue: 1834.92, growth: 8.7 },
    { id: '3', name: 'Caesar Salad', quantity: 63, revenue: 1195.74, growth: 12.1 },
    { id: '4', name: 'Chocolate Lava Cake', quantity: 48, revenue: 959.04, growth: 21.5 },
    { id: '5', name: 'Mojito', quantity: 72, revenue: 792.00, growth: 5.2 }
  ];

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Handle date range change
  const handleDateRangeChange = (range: ReportFilters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const downloadReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Downloading report in ${format} format`);
    // Implementation for downloading report
  };

  const printReport = () => {
    console.log('Printing report');
    // Implementation for printing report
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sales Report
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive analysis of sales performance and trends
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value as any)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="dropdown dropdown-end">
            <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="dropdown-content">
              <button onClick={() => downloadReport('pdf')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                PDF
              </button>
              <button onClick={() => downloadReport('excel')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Excel
              </button>
              <button onClick={() => downloadReport('csv')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                CSV
              </button>
            </div>
          </div>
          
          <button
            onClick={printReport}
            className={`p-2 rounded-lg border transition-colors duration-200 ${
              theme === 'dark'
                ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                : 'border-gray-200 hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{salesSummary.growth}%</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              ${salesSummary.totalSales.toLocaleString()}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Sales
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+8.2%</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {salesSummary.totalOrders.toLocaleString()}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Orders
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-accent-600" />
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+3.5%</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              ${salesSummary.averageOrderValue.toFixed(2)}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Average Order Value
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-success-600" />
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+5.3%</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              22 min
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Avg. Order Time
            </p>
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sales Trend
          </h3>
          <div className="flex space-x-2">
            <button className={`px-3 py-1 rounded-lg text-xs font-medium ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              Revenue
            </button>
            <button className={`px-3 py-1 rounded-lg text-xs font-medium ${
              theme === 'dark' 
                ? 'bg-gray-600 text-white' 
                : 'bg-primary-500 text-white'
            }`}>
              Orders
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailySales}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Sales']}
                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category and Payment Method Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sales by Category
          </h3>
          <div className="h-64 flex items-center">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height={200}>
                <RechartPie>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sales"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Sales']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                    }}
                  />
                </RechartPie>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2">
              <div className="space-y-3">
                {categorySales.map((category, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {category.category}
                        </span>
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${category.sales.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="h-1 rounded-full"
                          style={{ 
                            width: `${category.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length] 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Payment Methods
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={paymentMethods}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="method"
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                  }}
                />
                <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <tr>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Item</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Quantity</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Revenue</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Growth</th>
              </tr>
            </thead>
            <tbody>
              {topSellingItems.map((item, index) => (
                <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.quantity}
                  </td>
                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-medium`}>
                    ${item.revenue.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 ${item.growth > 0 ? 'text-success-600' : 'text-error-600'} font-medium`}>
                    <div className="flex items-center space-x-1">
                      {item.growth > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      <span>{item.growth.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button className={`text-sm font-medium text-primary-600 flex items-center space-x-1 ml-auto`}>
            <span>View All Items</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Time-Based Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Hourly Sales Distribution
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { hour: '10 AM', sales: 780 },
                  { hour: '11 AM', sales: 950 },
                  { hour: '12 PM', sales: 2450 },
                  { hour: '1 PM', sales: 3100 },
                  { hour: '2 PM', sales: 1850 },
                  { hour: '3 PM', sales: 1100 },
                  { hour: '4 PM', sales: 980 },
                  { hour: '5 PM', sales: 1250 },
                  { hour: '6 PM', sales: 2780 },
                  { hour: '7 PM', sales: 3450 },
                  { hour: '8 PM', sales: 2850 },
                  { hour: '9 PM', sales: 2100 },
                  { hour: '10 PM', sales: 1450 }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="hour"
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                  }}
                />
                <Bar dataKey="sales" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Sales by Day of Week
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { day: 'Monday', sales: 3245.75 },
                  { day: 'Tuesday', sales: 2980.25 },
                  { day: 'Wednesday', sales: 3520.50 },
                  { day: 'Thursday', sales: 4280.00 },
                  { day: 'Friday', sales: 4850.75 },
                  { day: 'Saturday', sales: 5250.25 },
                  { day: 'Sunday', sales: 4453.00 }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="day"
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tickFormatter={(value) => `$${value/1000}k`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                  }}
                />
                <Bar dataKey="sales" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;