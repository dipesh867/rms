import React, { useState } from 'react';
import { 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  Download, 
  Printer,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  Trash2,
  CircleDot,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ReportFilters {
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  category: string;
  supplier: string;
  status: string;
}

interface InventorySummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  itemsToReorder: number;
  wastePercentage: number;
  inventoryTurnover: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number;
  costPerUnit: number;
  totalValue: number;
  usage: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  daysUntilReorder: number;
}

interface InventoryUsage {
  date: string;
  usage: number;
  waste: number;
}

interface CategoryUsage {
  category: string;
  usage: number;
  percentage: number;
  value: number;
}

interface WasteLog {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  reason: string;
  cost: number;
  date: Date;
  reportedBy: string;
}

const InventoryReport: React.FC = () => {
  const { theme } = useApp();
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'month',
    category: 'all',
    supplier: 'all',
    status: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'waste'>('overview');

  // Mock data
  const inventorySummary: InventorySummary = {
    totalItems: 128,
    totalValue: 12580.50,
    lowStockItems: 8,
    itemsToReorder: 5,
    wastePercentage: 3.2,
    inventoryTurnover: 4.5
  };

  const inventoryItems: InventoryItem[] = [
    { id: '1', name: 'Tomatoes', category: 'Vegetables', currentStock: 25, unit: 'kg', minStock: 10, costPerUnit: 3.50, totalValue: 87.50, usage: 12.5, status: 'in-stock', daysUntilReorder: 8 },
    { id: '2', name: 'Chicken Breast', category: 'Meat', currentStock: 15, unit: 'kg', minStock: 20, costPerUnit: 9.99, totalValue: 149.85, usage: 8.2, status: 'low-stock', daysUntilReorder: 2 },
    { id: '3', name: 'Mozzarella Cheese', category: 'Dairy', currentStock: 8, unit: 'kg', minStock: 10, costPerUnit: 12.99, totalValue: 103.92, usage: 5.5, status: 'low-stock', daysUntilReorder: 1 },
    { id: '4', name: 'Olive Oil', category: 'Pantry', currentStock: 12, unit: 'L', minStock: 5, costPerUnit: 18.50, totalValue: 222.00, usage: 2.1, status: 'in-stock', daysUntilReorder: 12 },
    { id: '5', name: 'Flour', category: 'Baking', currentStock: 35, unit: 'kg', minStock: 20, costPerUnit: 1.50, totalValue: 52.50, usage: 6.8, status: 'in-stock', daysUntilReorder: 10 }
  ];

  const inventoryUsage: InventoryUsage[] = [
    { date: '2025-04-01', usage: 245.75, waste: 12.50 },
    { date: '2025-04-02', usage: 210.25, waste: 8.75 },
    { date: '2025-04-03', usage: 285.50, waste: 10.20 },
    { date: '2025-04-04', usage: 320.00, waste: 15.40 },
    { date: '2025-04-05', usage: 350.75, waste: 18.25 },
    { date: '2025-04-06', usage: 280.25, waste: 14.30 },
    { date: '2025-04-07', usage: 245.00, waste: 9.80 }
  ];

  const categoryUsage: CategoryUsage[] = [
    { category: 'Vegetables', usage: 850.50, percentage: 32.7, value: 1250.75 },
    { category: 'Meat', usage: 1230.25, percentage: 26.1, value: 3450.50 },
    { category: 'Dairy', usage: 620.75, percentage: 16.8, value: 1820.25 },
    { category: 'Pantry', usage: 450.00, percentage: 14.8, value: 2350.00 },
    { category: 'Beverages', usage: 330.00, percentage: 9.6, value: 980.50 }
  ];

  const wasteLogs: WasteLog[] = [
    { id: '1', itemName: 'Tomatoes', quantity: 2.5, unit: 'kg', reason: 'Spoilage', cost: 8.75, date: new Date('2025-04-02'), reportedBy: 'John Smith' },
    { id: '2', itemName: 'Chicken Breast', quantity: 1.2, unit: 'kg', reason: 'Quality Issue', cost: 11.99, date: new Date('2025-04-03'), reportedBy: 'Sarah Johnson' },
    { id: '3', itemName: 'Lettuce', quantity: 0.8, unit: 'kg', reason: 'Spoilage', cost: 4.80, date: new Date('2025-04-04'), reportedBy: 'Mike Wilson' },
    { id: '4', itemName: 'Milk', quantity: 1, unit: 'L', reason: 'Expired', cost: 3.99, date: new Date('2025-04-05'), reportedBy: 'Emma Davis' }
  ];

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Handle date range change
  const handleDateRangeChange = (range: ReportFilters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const downloadReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Downloading inventory report in ${format} format`);
    // Implementation for downloading report
  };

  const printReport = () => {
    console.log('Printing inventory report');
    // Implementation for printing report
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-success-100 text-success-800';
      case 'low-stock':
        return 'bg-warning-100 text-warning-800';
      case 'out-of-stock':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CircleDot className="w-3 h-3 text-success-600" />;
      case 'low-stock':
        return <AlertTriangle className="w-3 h-3 text-warning-600" />;
      case 'out-of-stock':
        return <Trash2 className="w-3 h-3 text-error-600" />;
      default:
        return <CircleDot className="w-3 h-3 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Inventory Report
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive analysis of inventory usage, waste, and value
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

      {/* Tab Navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Package },
            { id: 'usage', label: 'Usage Analysis', icon: TrendingUp },
            { id: 'waste', label: 'Waste Management', icon: Trash2 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : theme === 'dark'
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium">
                  <RefreshCw className="w-4 h-4 text-primary-600" />
                  <span className="text-primary-600">{inventorySummary.inventoryTurnover}</span>
                </div>
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${inventorySummary.totalValue.toLocaleString()}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Inventory Value
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-warning-600" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium">
                  <span className="text-warning-600">{inventorySummary.itemsToReorder}</span>
                </div>
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {inventorySummary.lowStockItems}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Low Stock Items
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-error-600" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium">
                  <ArrowDownRight className="w-4 h-4 text-success-600" />
                  <span className="text-success-600">-0.5%</span>
                </div>
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {inventorySummary.wastePercentage}%
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Waste Percentage
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Items Table */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Current Inventory Status
              </h3>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-64 pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                </div>
                
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  <option value="all">All Categories</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="meat">Meat</option>
                  <option value="dairy">Dairy</option>
                  <option value="pantry">Pantry</option>
                </select>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className={`px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  <option value="all">All Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Item</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Category</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Current Stock</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Min Stock</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Cost/Unit</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Total Value</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Days Left</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="font-medium">{item.name}</div>
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.category}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.currentStock} {item.unit}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {item.minStock} {item.unit}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${item.costPerUnit}
                      </td>
                      <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${item.totalValue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span>{item.status.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className={`py-3 px-4 ${
                        item.daysUntilReorder <= 2 ? 'text-error-600 font-medium' : 
                        item.daysUntilReorder <= 5 ? 'text-warning-600 font-medium' :
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {item.daysUntilReorder}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Usage Analysis Tab */}
      {activeTab === 'usage' && (
        <>
          {/* Usage Chart */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Daily Inventory Usage
              </h3>
              <div className="flex space-x-2">
                <button className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-gray-600 text-white' 
                    : 'bg-primary-500 text-white'
                }`}>
                  Usage
                </button>
                <button className={`px-3 py-1 rounded-lg text-xs font-medium ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  Waste
                </button>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={inventoryUsage}
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
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                      border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="usage"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="waste"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Usage by Category
              </h3>
              <div className="h-64 flex items-center">
                <div className="w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryUsage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="usage"
                      >
                        {categoryUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Usage']}
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                          border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2">
                  <div className="space-y-3">
                    {categoryUsage.map((category, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                              {category.category}
                            </span>
                            <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              ${category.usage.toLocaleString()}
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

            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Inventory Value by Category
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryUsage}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                    <XAxis 
                      dataKey="category"
                      stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                    />
                    <YAxis 
                      stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Value']}
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                      }}
                    />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Waste Management Tab */}
      {activeTab === 'waste' && (
        <>
          {/* Waste Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-error-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-error-600" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium">
                  <ArrowDownRight className="w-4 h-4 text-success-600" />
                  <span className="text-success-600">-0.5%</span>
                </div>
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${inventoryUsage.reduce((sum, day) => sum + day.waste, 0).toFixed(2)}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Waste Value
                </p>
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-warning-600" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium">
                  <span className="text-warning-600">{inventorySummary.wastePercentage}%</span>
                </div>
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {wasteLogs.length}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Waste Incidents
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
                  <DollarSign className="w-6 h-6 text-success-600" />
                </div>
                <div className="flex items-center space-x-1 text-sm font-medium">
                  <span className="text-success-600">
                    {Math.round((inventorySummary.wastePercentage / inventorySummary.totalValue) * 100) / 100}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  ${(inventorySummary.totalValue * (inventorySummary.wastePercentage / 100)).toFixed(2)}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Cost Impact
                </p>
              </div>
            </div>
          </div>

          {/* Waste Log */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Waste Log
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Date</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Item</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Quantity</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Reason</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Cost</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Reported By</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteLogs.map((log) => (
                    <tr key={log.id} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {log.date.toLocaleDateString()}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div className="font-medium">{log.itemName}</div>
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {log.quantity} {log.unit}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {log.reason}
                      </td>
                      <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${log.cost.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {log.reportedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InventoryReport;