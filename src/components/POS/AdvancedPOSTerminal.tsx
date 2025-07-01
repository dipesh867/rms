import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, ShoppingCart, CreditCard, Calculator, Printer, User, Percent, DollarSign, Split, Merge, Bold as Hold, Play, Users, Clock, ChefHat, Receipt, Hash } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MenuItem, OrderItem, Order } from '../../types';

interface RunningOrder {
  id: string;
  tableId: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: 'active' | 'hold' | 'completed';
  createdAt: Date;
  waiterAssigned?: string;
}

const AdvancedPOSTerminal: React.FC = () => {
  const { theme, menuItems, tables, addOrder, addNotification, staff } = useApp();
  const [activeTab, setActiveTab] = useState<'tables' | 'new-order' | 'running-orders' | 'billing' | 'history'>('tables');
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [discount, setDiscount] = useState(0);
  const [tip, setTip] = useState(0);
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedWaiter, setSelectedWaiter] = useState<string>('');
  const [runningOrders, setRunningOrders] = useState<RunningOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RunningOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'wallet'>('cash');

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const availableTables = tables.filter(table => table.status === 'available' || table.status === 'occupied');
  const occupiedTables = tables.filter(table => table.status === 'occupied');

  // Mock running orders for demonstration
  useEffect(() => {
    setRunningOrders([
      {
        id: 'RO001',
        tableId: 'A2',
        items: [
          {
            id: '1',
            menuItemId: '1',
            menuItem: menuItems[0],
            quantity: 2,
            status: 'preparing',
            addedAt: new Date(),
            unitPrice: 24.99
          }
        ],
        subtotal: 49.98,
        total: 59.18,
        status: 'active',
        createdAt: new Date(Date.now() - 15 * 60 * 1000),
        waiterAssigned: 'John Doe'
      }
    ]);
  }, [menuItems]);

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = selectedItems.find(item => item.menuItemId === menuItem.id);
    
    if (existingItem) {
      setSelectedItems(prev => 
        prev.map(item => 
          item.menuItemId === menuItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        menuItemId: menuItem.id,
        menuItem,
        quantity: 1,
        status: 'pending',
        addedAt: new Date(),
        unitPrice: menuItem.price
      };
      setSelectedItems(prev => [...prev, newItem]);
    }
  };

  const updateQuantity = (itemId: string, change: number) => {
    setSelectedItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const addCustomInstructions = (itemId: string, instructions: string) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, notes: instructions } : item
      )
    );
  };

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discountAmount = (subtotal * discount) / 100;
    const tax = (subtotal - discountAmount) * 0.1; // 10% tax
    const serviceCharge = (subtotal - discountAmount) * 0.05; // 5% service charge
    const tipAmount = (subtotal * tip) / 100;
    const total = subtotal - discountAmount + tax + serviceCharge + tipAmount;

    return { subtotal, discountAmount, tax, serviceCharge, tipAmount, total };
  };

  const { subtotal, discountAmount, tax, serviceCharge, tipAmount, total } = calculateTotals();

  const holdOrder = () => {
    if (selectedItems.length === 0 || !selectedTable) return;

    const newOrder: RunningOrder = {
      id: `HO${Date.now()}`,
      tableId: selectedTable,
      items: selectedItems,
      subtotal,
      total,
      status: 'hold',
      createdAt: new Date(),
      waiterAssigned: selectedWaiter
    };

    setRunningOrders(prev => [...prev, newOrder]);
    clearCurrentOrder();
    addNotification({
      title: 'Order Held',
      message: `Order for table ${selectedTable} has been put on hold`,
      type: 'info'
    });
  };

  const resumeOrder = (order: RunningOrder) => {
    setSelectedItems(order.items);
    setSelectedTable(order.tableId);
    setSelectedWaiter(order.waiterAssigned || '');
    setRunningOrders(prev => prev.filter(o => o.id !== order.id));
    setActiveTab('new-order');
  };

  const splitBill = () => {
    // Implementation for bill splitting
    addNotification({
      title: 'Split Bill',
      message: 'Bill splitting feature activated',
      type: 'info'
    });
  };

  const mergeBills = () => {
    // Implementation for bill merging
    addNotification({
      title: 'Merge Bills',
      message: 'Bill merging feature activated',
      type: 'info'
    });
  };

  const clearCurrentOrder = () => {
    setSelectedItems([]);
    setSelectedTable('');
    setDiscount(0);
    setTip(0);
    setCustomerNotes('');
    setSelectedWaiter('');
  };

  const processOrder = () => {
    if (selectedItems.length === 0) {
      addNotification({
        title: 'No Items',
        message: 'Please add items to the order',
        type: 'warning'
      });
      return;
    }

    if (!selectedTable) {
      addNotification({
        title: 'No Table Selected',
        message: 'Please select a table for the order',
        type: 'warning'
      });
      return;
    }

    const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      tableId: selectedTable,
      items: selectedItems,
      status: 'active',
      subtotal,
      tax,
      serviceCharge,
      discount: discountAmount,
      total,
      notes: customerNotes,
      orderType: 'dine-in',
      paymentMethod
    };

    addOrder(newOrder);
    clearCurrentOrder();
    setActiveTab('tables');

    addNotification({
      title: 'Order Created',
      message: `Order for table ${selectedTable} has been sent to kitchen`,
      type: 'success'
    });
  };

  const printBill = () => {
    addNotification({
      title: 'Printing Bill',
      message: 'Bill sent to printer',
      type: 'info'
    });
  };

  const emailBill = () => {
    addNotification({
      title: 'Email Sent',
      message: 'Bill has been emailed to customer',
      type: 'success'
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
        <nav className="flex space-x-8">
          {[
            { id: 'tables', label: 'Table View', icon: Users },
            { id: 'new-order', label: 'New Order', icon: Plus },
            { id: 'running-orders', label: 'Running Orders', icon: Clock },
            { id: 'billing', label: 'Billing', icon: Receipt },
            { id: 'history', label: 'History', icon: Hash }
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
                {tab.id === 'running-orders' && runningOrders.length > 0 && (
                  <span className="bg-error-500 text-white text-xs rounded-full px-2 py-0.5">
                    {runningOrders.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {/* Table View Tab */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Table Management
              </h2>
              <div className="flex space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  Available: {tables.filter(t => t.status === 'available').length}
                </span>
                <span className="px-3 py-1 rounded-full text-sm bg-error-100 text-error-800">
                  Occupied: {occupiedTables.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => {
                    setSelectedTable(table.id);
                    setActiveTab('new-order');
                  }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    table.status === 'available'
                      ? theme === 'dark'
                        ? 'border-green-600 bg-green-900/20 hover:bg-green-800/30'
                        : 'border-green-300 bg-green-50 hover:bg-green-100'
                      : table.status === 'occupied'
                        ? theme === 'dark'
                          ? 'border-red-600 bg-red-900/20 hover:bg-red-800/30'
                          : 'border-red-300 bg-red-50 hover:bg-red-100'
                        : theme === 'dark'
                          ? 'border-yellow-600 bg-yellow-900/20 hover:bg-yellow-800/30'
                          : 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${
                      table.status === 'available' ? 'text-green-600' :
                      table.status === 'occupied' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {table.number}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {table.capacity} seats
                    </div>
                    <div className={`text-xs mt-1 capitalize ${
                      table.status === 'available' ? 'text-green-600' :
                      table.status === 'occupied' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {table.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Order Tab */}
        {activeTab === 'new-order' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Menu Items */}
            <div className={`lg:col-span-2 ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } rounded-xl shadow-lg`}>
              {/* Search and Categories */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search menu items..."
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
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Menu Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => addToCart(item)}
                      className={`p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-200 hover:scale-105 ${
                        theme === 'dark'
                          ? 'border-gray-600 hover:border-primary-400 bg-gray-700 hover:bg-gray-600'
                          : 'border-gray-200 hover:border-primary-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-24 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className={`font-medium text-sm mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </h3>
                      <p className={`text-xs mb-2 line-clamp-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${item.price.toFixed(2)}
                        </span>
                        <Plus className="w-4 h-4 text-primary-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className={`${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } rounded-xl shadow-lg flex flex-col`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-xl font-bold flex items-center space-x-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Current Order</span>
                </h2>
                
                {/* Table and Waiter Selection */}
                <div className="mt-4 space-y-3">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Table
                    </label>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    >
                      <option value="">Choose a table</option>
                      {availableTables.map(table => (
                        <option key={table.id} value={table.id}>
                          Table {table.number} ({table.capacity} seats) - {table.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Assign Waiter
                    </label>
                    <select
                      value={selectedWaiter}
                      onChange={(e) => setSelectedWaiter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    >
                      <option value="">Select waiter</option>
                      {staff.filter(s => s.role === 'Waiter').map(waiter => (
                        <option key={waiter.id} value={waiter.name}>
                          {waiter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="flex-1 p-6 space-y-4 max-h-96 overflow-y-auto">
                {selectedItems.length === 0 ? (
                  <div className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No items added yet</p>
                  </div>
                ) : (
                  selectedItems.map((item) => (
                    <div key={item.id} className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.menuItem?.name}
                          </h4>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            ${item.unitPrice.toFixed(2)} each
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 rounded hover:bg-error-100 text-error-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className={`p-1 rounded ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-gray-300' 
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className={`w-8 text-center ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className={`p-1 rounded ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-gray-300' 
                                : 'hover:bg-gray-200 text-gray-600'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <span className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Custom Instructions */}
                      <input
                        type="text"
                        placeholder="Special instructions..."
                        value={item.notes || ''}
                        onChange={(e) => addCustomInstructions(item.id, e.target.value)}
                        className={`w-full mt-2 px-2 py-1 text-xs rounded border ${
                          theme === 'dark'
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Order Actions and Totals */}
              {selectedItems.length > 0 && (
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  {/* Order Control Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={holdOrder}
                      className={`py-2 px-3 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2 ${
                        theme === 'dark'
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Hold className="w-4 h-4" />
                      <span>Hold</span>
                    </button>
                    <button
                      onClick={splitBill}
                      className={`py-2 px-3 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2 ${
                        theme === 'dark'
                          ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Split className="w-4 h-4" />
                      <span>Split</span>
                    </button>
                  </div>

                  {/* Discount and Tip */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Tip (%)
                        </label>
                        <input
                          type="number"
                          value={tip}
                          onChange={(e) => setTip(Math.max(0, Number(e.target.value)))}
                          className={`w-full px-3 py-2 rounded-lg border text-sm ${
                            theme === 'dark'
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-gray-50 border-gray-200 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Customer Notes */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Order Notes
                      </label>
                      <textarea
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Special instructions for the kitchen..."
                        className={`w-full px-3 py-2 rounded-lg border text-sm ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 mb-4">
                    <div className={`flex justify-between text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-success-600">
                        <span>Discount ({discount}%):</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className={`flex justify-between text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span>Tax (10%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className={`flex justify-between text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span>Service (5%):</span>
                      <span>${serviceCharge.toFixed(2)}</span>
                    </div>
                    {tip > 0 && (
                      <div className={`flex justify-between text-sm ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <span>Tip ({tip}%):</span>
                        <span>${tipAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className={`flex justify-between text-lg font-bold pt-2 border-t ${
                      theme === 'dark' 
                        ? 'text-white border-gray-600' 
                        : 'text-gray-900 border-gray-200'
                    }`}>
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {['cash', 'card', 'upi', 'wallet'].map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method as any)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            paymentMethod === method
                              ? 'bg-primary-500 text-white'
                              : theme === 'dark'
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {method.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={processOrder}
                      disabled={!selectedTable || selectedItems.length === 0}
                      className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Send to Kitchen</span>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={printBill}
                        className={`py-2 px-4 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2 ${
                          theme === 'dark'
                            ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print</span>
                      </button>
                      <button
                        onClick={emailBill}
                        className={`py-2 px-4 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2 ${
                          theme === 'dark'
                            ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Running Orders Tab */}
        {activeTab === 'running-orders' && (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Running Orders
            </h2>
            
            {runningOrders.length === 0 ? (
              <div className={`text-center py-12 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No running orders</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {runningOrders.map((order) => (
                  <div key={order.id} className={`p-6 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  } shadow-lg`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Table {order.tableId}
                        </h3>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Order #{order.id}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'active' ? 'bg-green-100 text-green-800' :
                        order.status === 'hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Items: {order.items.length}
                      </p>
                      <p className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${order.total.toFixed(2)}
                      </p>
                      {order.waiterAssigned && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Waiter: {order.waiterAssigned}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {order.status === 'hold' && (
                        <button
                          onClick={() => resumeOrder(order)}
                          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Resume</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className={`flex-1 py-2 px-3 rounded-lg border transition-colors duration-200 ${
                          theme === 'dark'
                            ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Billing & Payment
            </h2>
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Select an order from Running Orders to process billing
              </p>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Order History
            </h2>
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Order history will be displayed here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPOSTerminal;