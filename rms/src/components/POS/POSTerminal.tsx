import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, ShoppingCart, CreditCard, Calculator, Printer, User, Percent, DollarSign, CarFront as ChairFront } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { MenuItem, OrderItem, Order, Chair } from '../../types';

const POSTerminal: React.FC = () => {
  const { theme, menuItems, tables, addOrder, addNotification } = useApp();
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [selectedChair, setSelectedChair] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [discount, setDiscount] = useState(0);
  const [customerNotes, setCustomerNotes] = useState('');
  const [chairsForTable, setChairsForTable] = useState<Chair[]>([]);
  const [orderByChair, setOrderByChair] = useState(false);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const availableTables = tables.filter(table => table.status === 'available' || table.status === 'occupied');

  // Update available chairs when selected table changes
  useEffect(() => {
    if (selectedTable) {
      const table = tables.find(t => t.id === selectedTable);
      if (table) {
        setChairsForTable(table.chairs);
        
        // If currently selected chair is not in the new table, reset it
        if (selectedChair && !table.chairs.some(c => c.id === selectedChair)) {
          setSelectedChair('');
        }
      } else {
        setChairsForTable([]);
        setSelectedChair('');
      }
    } else {
      setChairsForTable([]);
      setSelectedChair('');
    }
  }, [selectedTable, tables]);

  const addToCart = (menuItem: MenuItem) => {
    const existingItem = selectedItems.find(item => 
      item.menuItemId === menuItem.id &&
      // Only match chairs if using chair ordering
      (!orderByChair || item.chairId === selectedChair)
    );
    
    if (existingItem) {
      setSelectedItems(prev => 
        prev.map(item => 
          item.menuItemId === menuItem.id && 
          (!orderByChair || item.chairId === selectedChair)
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
        unitPrice: menuItem.price,
        chairId: orderByChair ? selectedChair : undefined
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

  const calculateTotals = () => {
    // Filter items by chair if chair-specific ordering is enabled
    const itemsToCalculate = orderByChair && selectedChair
      ? selectedItems.filter(item => item.chairId === selectedChair)
      : selectedItems;

    const subtotal = itemsToCalculate.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const discountAmount = (subtotal * discount) / 100;
    const tax = (subtotal - discountAmount) * 0.1; // 10% tax
    const serviceCharge = (subtotal - discountAmount) * 0.05; // 5% service charge
    const total = subtotal - discountAmount + tax + serviceCharge;

    return { subtotal, discountAmount, tax, serviceCharge, total };
  };

  const { subtotal, discountAmount, tax, serviceCharge, total } = calculateTotals();

  const processOrder = () => {
    // Basic validation
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

    if (orderByChair && !selectedChair) {
      addNotification({
        title: 'No Chair Selected',
        message: 'Please select a chair for the order',
        type: 'warning'
      });
      return;
    }

    // Create the order - if order by chair is enabled, create a chair-specific order
    const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
      tableId: selectedTable,
      chairId: orderByChair ? selectedChair : undefined,
      items: orderByChair ? 
        // For chair orders, only include items for the selected chair
        selectedItems.filter(item => item.chairId === selectedChair) :
        // For table orders, include all items
        selectedItems,
      status: 'active',
      subtotal,
      tax,
      serviceCharge,
      discount: discountAmount,
      total,
      notes: customerNotes,
      orderType: 'dine-in',
      paymentMethod: 'cash'
    };

    addOrder(newOrder);
    
    // Reset form
    setSelectedItems([]);
    if (!orderByChair) {
      setSelectedTable('');
      setSelectedChair('');
    }
    setDiscount(0);
    setCustomerNotes('');

    addNotification({
      title: 'Order Created',
      message: `Order for ${orderByChair ? 'Chair ' + chairsForTable.find(c => c.id === selectedChair)?.number : 'Table ' + tables.find(t => t.id === selectedTable)?.number} has been created successfully`,
      type: 'success'
    });
  };

  return (
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
          
          {/* Order by Chair Toggle */}
          <div className="mt-4 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={orderByChair}
                onChange={() => {
                  setOrderByChair(!orderByChair);
                  // Clear selected items when switching modes
                  setSelectedItems([]);
                  if (!orderByChair) {
                    setSelectedChair(''); // Clear selected chair when enabling
                  }
                }}
                className="sr-only peer"
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Order by Chair
              </span>
            </label>
          </div>
          
          {/* Table and Chair Selection */}
          <div className="mt-4 space-y-3">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Select Table
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
                    Table {table.number} ({table.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            {/* Chair selection dropdown if order-by-chair is enabled */}
            {orderByChair && selectedTable && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Chair
                </label>
                <select
                  value={selectedChair}
                  onChange={(e) => setSelectedChair(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                >
                  <option value="">Choose a chair</option>
                  {chairsForTable.map(chair => (
                    <option 
                      key={chair.id} 
                      value={chair.id}
                      disabled={chair.status === 'cleaning'}
                    >
                      Chair {chair.number} ({chair.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Show chair visualization for selected table */}
            {selectedTable && chairsForTable.length > 0 && (
              <div className="mt-2">
                <div className={`p-3 rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="text-xs text-gray-500 mb-2">
                    Chair Status:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {chairsForTable.map(chair => (
                      <div 
                        key={chair.id}
                        onClick={() => orderByChair && setSelectedChair(chair.id)}
                        className={`relative w-9 h-9 rounded-md border flex items-center justify-center cursor-pointer ${
                          chair.id === selectedChair
                            ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                            : chair.status === 'available'
                              ? 'border-success-200 bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300'
                              : chair.status === 'occupied'
                                ? 'border-error-200 bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-300'
                                : 'border-gray-200 bg-gray-100 text-gray-400 dark:bg-gray-800 dark:border-gray-700'
                        } ${orderByChair ? 'hover:border-primary-400' : ''}`}
                      >
                        <ChairFront className="w-5 h-5" />
                        <span className="absolute -bottom-1 -right-1 text-[10px] font-bold bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 w-4 h-4 flex items-center justify-center rounded-full">
                          {chair.number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-80">
          {selectedItems.length === 0 ? (
            <div className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No items added yet</p>
            </div>
          ) : (
            // If ordering by chair, only show items for the selected chair
            (orderByChair && selectedChair 
              ? selectedItems.filter(item => item.chairId === selectedChair)
              : selectedItems
            ).map((item) => (
              <div key={item.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center">
                    <h4 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.menuItem?.name}
                    </h4>
                    {orderByChair && !selectedChair && item.chairId && (
                      <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                        theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        Chair {chairsForTable.find(c => c.id === item.chairId)?.number || '?'}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    ${item.unitPrice.toFixed(2)} each
                  </p>
                </div>
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
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded hover:bg-error-100 text-error-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Order Totals and Actions */}
        {selectedItems.length > 0 && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {/* Discount */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Discount (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className={`flex-1 px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  min="0"
                  max="100"
                />
                <Percent className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Customer Notes */}
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Notes
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Special instructions..."
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                rows={2}
              />
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
              <div className={`flex justify-between text-lg font-bold pt-2 border-t ${
                theme === 'dark' 
                  ? 'text-white border-gray-600' 
                  : 'text-gray-900 border-gray-200'
              }`}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={processOrder}
                disabled={!selectedTable || (orderByChair && !selectedChair) || selectedItems.length === 0}
                className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Process Order</span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className={`py-2 px-4 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}>
                  <Calculator className="w-4 h-4" />
                  <span>Calculate</span>
                </button>
                <button className={`py-2 px-4 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2 ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}>
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POSTerminal;