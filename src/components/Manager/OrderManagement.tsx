import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Printer,
  Download,
  RefreshCw,
  DollarSign,
  User,
  Utensils,
  MapPin
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ExtendedOrder {
  id: string;
  tableId: string;
  customerName?: string;
  customerPhone?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  items: any[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  orderTime: Date;
  estimatedTime?: number;
  completedTime?: Date;
  notes?: string;
  waiterAssigned?: string;
  priority: 'normal' | 'high' | 'urgent';
}

const OrderManagement: React.FC = () => {
  const { theme, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedOrder, setSelectedOrder] = useState<ExtendedOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Extended mock orders
  const [extendedOrders] = useState<ExtendedOrder[]>([
    {
      id: 'ORD001',
      tableId: 'A2',
      customerName: 'John Smith',
      customerPhone: '+1234567890',
      orderType: 'dine-in',
      status: 'preparing',
      items: [
        { name: 'Margherita Pizza', quantity: 2, price: 24.99 },
        { name: 'Caesar Salad', quantity: 1, price: 18.99 }
      ],
      subtotal: 68.97,
      tax: 6.90,
      discount: 0,
      total: 75.87,
      paymentStatus: 'pending',
      orderTime: new Date(Date.now() - 25 * 60 * 1000),
      estimatedTime: 30,
      waiterAssigned: 'Sarah Johnson',
      priority: 'normal'
    },
    {
      id: 'ORD002',
      tableId: 'B1',
      customerName: 'Emma Wilson',
      orderType: 'dine-in',
      status: 'ready',
      items: [
        { name: 'Grilled Salmon', quantity: 1, price: 32.99 },
        { name: 'Wine Glass', quantity: 2, price: 12.00 }
      ],
      subtotal: 56.99,
      tax: 5.70,
      discount: 5.00,
      total: 57.69,
      paymentStatus: 'paid',
      paymentMethod: 'Card',
      orderTime: new Date(Date.now() - 45 * 60 * 1000),
      estimatedTime: 25,
      waiterAssigned: 'Mike Chen',
      priority: 'high'
    },
    {
      id: 'ORD003',
      tableId: 'Takeaway',
      customerName: 'David Brown',
      customerPhone: '+1234567892',
      orderType: 'takeaway',
      status: 'completed',
      items: [
        { name: 'Burger Combo', quantity: 3, price: 15.99 }
      ],
      subtotal: 47.97,
      tax: 4.80,
      discount: 0,
      total: 52.77,
      paymentStatus: 'paid',
      paymentMethod: 'Cash',
      orderTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedTime: new Date(Date.now() - 90 * 60 * 1000),
      priority: 'normal'
    }
  ]);

  const statusOptions = [
    { value: 'all', label: 'All Orders', count: extendedOrders.length },
    { value: 'pending', label: 'Pending', count: extendedOrders.filter(o => o.status === 'pending').length },
    { value: 'preparing', label: 'Preparing', count: extendedOrders.filter(o => o.status === 'preparing').length },
    { value: 'ready', label: 'Ready', count: extendedOrders.filter(o => o.status === 'ready').length },
    { value: 'completed', label: 'Completed', count: extendedOrders.filter(o => o.status === 'completed').length }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'served':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'cancelled':
        return 'bg-error-100 text-error-800 border-error-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <AlertTriangle className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredOrders = extendedOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesType = selectedType === 'all' || order.orderType === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    console.log(`Updating order ${orderId} to ${newStatus}`);
    // Implementation for status update
  };

  const printOrder = (order: ExtendedOrder) => {
    console.log('Printing order:', order.id);
    // Implementation for printing
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Order Management
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor and manage all restaurant orders in real-time
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`flex rounded-lg border ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'kanban'
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Kanban
            </button>
          </div>
          <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statusOptions.slice(1, 5).map((status, index) => (
          <div key={status.value} className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
          onClick={() => setSelectedStatus(status.value)}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {status.count}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {status.label}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                index === 0 ? 'bg-yellow-100' :
                index === 1 ? 'bg-orange-100' :
                index === 2 ? 'bg-green-100' : 'bg-success-100'
              }`}>
                {getStatusIcon(status.value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search by order ID or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            <option value="all">All Types</option>
            <option value="dine-in">Dine In</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>

          <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Orders Display */}
      {viewMode === 'list' ? (
        <div className={`rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`border-b ${
                theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
              }`}>
                <tr>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Order</th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Customer</th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Type</th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Status</th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Total</th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Time</th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={`border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-8 rounded ${getPriorityColor(order.priority)}`}></div>
                        <div>
                          <div className="font-medium">#{order.id}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {order.tableId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div>
                        <div className="font-medium">{order.customerName || 'Walk-in'}</div>
                        {order.customerPhone && (
                          <div className="text-sm">{order.customerPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span className="capitalize flex items-center space-x-1">
                        {order.orderType === 'dine-in' && <Utensils className="w-4 h-4" />}
                        {order.orderType === 'takeaway' && <MapPin className="w-4 h-4" />}
                        {order.orderType === 'delivery' && <MapPin className="w-4 h-4" />}
                        <span>{order.orderType.replace('-', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </span>
                    </td>
                    <td className={`py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${order.total.toFixed(2)}
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div className="text-sm">
                        <div>{order.orderTime.toLocaleTimeString()}</div>
                        {order.estimatedTime && (
                          <div className="text-xs">ETA: {order.estimatedTime}min</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderModal(true);
                          }}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors duration-200`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => printOrder(order)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors duration-200`}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="served">Served</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Kanban View
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['pending', 'preparing', 'ready', 'completed'].map((status) => (
            <div key={status} className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 capitalize ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {status} ({filteredOrders.filter(o => o.status === status).length})
              </h3>
              <div className="space-y-3">
                {filteredOrders
                  .filter(order => order.status === status)
                  .map((order) => (
                    <div key={order.id} className={`p-4 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-200'
                    } hover:shadow-md transition-all duration-200 cursor-pointer`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          #{order.id}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                          {order.tableId}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {order.customerName || 'Walk-in'}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${order.total.toFixed(2)}
                        </span>
                        <span className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {order.orderTime.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 max-h-screen overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order Details - #{selectedOrder.id}
              </h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Customer</label>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedOrder.customerName || 'Walk-in Customer'}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Table/Location</label>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedOrder.tableId}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Order Type</label>
                  <p className={`font-medium capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedOrder.orderType.replace('-', ' ')}
                  </p>
                </div>
                <div>
                  <label className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>Order Time</label>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {selectedOrder.orderTime.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Items
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className={`flex justify-between items-center p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </span>
                        <span className={`ml-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          x{item.quantity}
                        </span>
                      </div>
                      <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedOrder.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={`flex justify-between font-bold text-lg pt-2 border-t ${
                    theme === 'dark' ? 'border-gray-600 text-white' : 'border-gray-200 text-gray-900'
                  }`}>
                    <span>Total:</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => printOrder(selectedOrder)}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;