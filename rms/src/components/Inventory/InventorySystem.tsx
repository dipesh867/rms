import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown,
  Download,
  Upload,
  BarChart3,
  Calendar,
  DollarSign,
  Truck,
  Eye,
  X,
  Save,
  Clock,
  Target
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useInventory } from '../../hooks/useInventory';
import { supabase } from '../../utils/supabase';
import InventoryItemForm from './InventoryItemForm';

interface InventoryDeduction {
  id: string;
  itemId: string;
  orderId: string;
  quantity: number;
  timestamp: Date;
  reason: 'order' | 'waste' | 'adjustment';
}

interface InventoryAlert {
  id: string;
  itemId: string;
  type: 'low-stock' | 'expired' | 'reorder';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

const InventorySystem: React.FC = () => {
  const { theme, inventory } = useApp();
  const { fetchInventory, inventoryItems, convertUnit } = useInventory();
  const [activeTab, setActiveTab] = useState<'inventory' | 'deductions' | 'alerts' | 'analytics'>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [deductions, setDeductions] = useState<InventoryDeduction[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get unique categories from inventory
  const categories = ['All', ...Array.from(new Set(inventoryItems.map(item => item.category)))];

  // Fetch inventory data
  useEffect(() => {
    fetchInventory();
    loadDeductions();
    loadAlerts();
  }, []);

  // Load inventory transactions for deductions tab
  const loadDeductions = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          id,
          inventory_item_id,
          order_id,
          quantity,
          transaction_type,
          notes,
          created_at,
          inventory_item:inventory_items(name, unit)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      
      if (data) {
        // Transform data into a more usable format
        const formattedDeductions = data.map(transaction => ({
          id: transaction.id,
          itemId: transaction.inventory_item_id,
          orderId: transaction.order_id || 'N/A',
          quantity: Math.abs(transaction.quantity),
          timestamp: new Date(transaction.created_at),
          reason: transaction.transaction_type as 'order' | 'waste' | 'adjustment',
          itemName: transaction.inventory_item?.name || 'Unknown',
          unit: transaction.inventory_item?.unit || ''
        }));
        
        setDeductions(formattedDeductions);
      }
    } catch (error) {
      console.error('Error loading deductions:', error);
    }
  };

  // Load alerts based on inventory status
  const loadAlerts = async () => {
    try {
      // Get low stock items
      const { data: lowStockData, error: lowStockError } = await supabase
        .from('inventory_items')
        .select('id, name, current_stock, min_stock, unit')
        .eq('status', 'low-stock');
        
      if (lowStockError) throw lowStockError;
      
      // Get expired items
      const { data: expiredData, error: expiredError } = await supabase
        .from('inventory_items')
        .select('id, name, expiry_date')
        .eq('status', 'expired');
        
      if (expiredError) throw expiredError;
      
      const alertsArray: InventoryAlert[] = [];
      
      // Add low stock alerts
      if (lowStockData) {
        lowStockData.forEach(item => {
          alertsArray.push({
            id: `low-${item.id}`,
            itemId: item.id,
            type: 'low-stock',
            message: `${item.name} is running low (${item.current_stock} ${item.unit} remaining, minimum: ${item.min_stock} ${item.unit})`,
            severity: item.current_stock === 0 ? 'high' : 'medium',
            timestamp: new Date()
          });
        });
      }
      
      // Add expired alerts
      if (expiredData) {
        expiredData.forEach(item => {
          alertsArray.push({
            id: `exp-${item.id}`,
            itemId: item.id,
            type: 'expired',
            message: `${item.name} has expired on ${new Date(item.expiry_date).toLocaleDateString()}`,
            severity: 'high',
            timestamp: new Date(item.expiry_date)
          });
        });
      }
      
      setAlerts(alertsArray);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const filteredInventory = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Record an inventory deduction
  const recordDeduction = async (itemId: string, quantity: number, reason: 'waste' | 'adjustment', notes?: string) => {
    try {
      // Record the transaction
      const { error } = await supabase
        .from('inventory_transactions')
        .insert({
          inventory_item_id: itemId,
          quantity: -quantity, // Negative for deductions
          transaction_type: reason,
          notes: notes || `Manual ${reason}`
        });
      
      if (error) throw error;
      
      // Refresh data
      await fetchInventory();
      await loadDeductions();
      await loadAlerts();
      
      toast.success(`Successfully recorded ${reason}`);
    } catch (error) {
      console.error(`Error recording ${reason}:`, error);
      toast.error(`Failed to record ${reason}`);
    }
  };

  // Simulate deduction for testing
  const deductInventory = (itemId: string, quantity: number, orderId: string = 'MANUAL') => {
    recordDeduction(itemId, quantity, 'adjustment', `Manual deduction from Inventory System (${orderId})`);
  };

  // Delete inventory item
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    setIsLoading(true);
    
    try {
      // Check if item is used in any menu
      const { data: usageData, error: usageError } = await supabase
        .from('menu_ingredients')
        .select('id')
        .eq('inventory_item_id', selectedItem.id);
      
      if (usageError) throw usageError;
      
      if (usageData && usageData.length > 0) {
        toast.error(`This item is used in ${usageData.length} menu recipes and cannot be deleted.`);
        setIsLoading(false);
        setShowDeleteConfirm(false);
        return;
      }
      
      // Delete the item
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', selectedItem.id);
      
      if (error) throw error;
      
      // Refresh inventory
      await fetchInventory();
      
      toast.success('Inventory item deleted successfully');
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      toast.error('Failed to delete inventory item');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle saving inventory item
  const handleSaveItem = () => {
    fetchInventory();
    setShowAddModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'low-stock':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'out-of-stock':
        return 'bg-error-100 text-error-800 border-error-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <CheckCircle className="w-4 h-4" />;
      case 'low-stock':
        return <AlertTriangle className="w-4 h-4" />;
      case 'out-of-stock':
        return <X className="w-4 h-4" />;
      case 'expired':
        return <Clock className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const calculateStockValue = () => {
    return inventoryItems.reduce((total, item) => total + (item.current_stock * item.cost_per_unit), 0);
  };

  const getLowStockItems = () => {
    return inventoryItems.filter(item => item.current_stock <= item.min_stock);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Inventory Management
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time inventory tracking with automatic deductions
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Upload className="w-4 h-4" />
            <span>Import Stock</span>
          </button>
          <button
            onClick={() => {
              setSelectedItem(null);
              setShowAddModal(true);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {inventoryItems.length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Items
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {getLowStockItems().length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Low Stock Items
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${calculateStockValue().toLocaleString()}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Stock Value
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {deductions.length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Today's Deductions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {[
            { id: 'inventory', label: 'Inventory Items', icon: Package },
            { id: 'deductions', label: 'Real-time Deductions', icon: TrendingDown },
            { id: 'alerts', label: 'Stock Alerts', icon: AlertTriangle },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
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
                {tab.id === 'alerts' && alerts.length > 0 && (
                  <span className="bg-error-500 text-white text-xs rounded-full px-2 py-0.5">
                    {alerts.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Inventory Items Tab */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Search and Filters */}
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
                  placeholder="Search inventory items..."
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
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inventory Table */}
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
                    }`}>Item</th>
                    <th className={`text-left py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Category</th>
                    <th className={`text-left py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Current Stock</th>
                    <th className={`text-left py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Min/Max</th>
                    <th className={`text-left py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Cost/Unit</th>
                    <th className={`text-left py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Total Value</th>
                    <th className={`text-left py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`text-left py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className={`border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div>
                          <div className="font-medium">{item.name}</div>
                        </div>
                      </td>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {item.category}
                      </td>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.current_stock}</span>
                          <span className="text-sm">{item.unit}</span>
                          {item.current_stock <= item.min_stock && (
                            <AlertTriangle className="w-4 h-4 text-warning-500" />
                          )}
                        </div>
                      </td>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {item.min_stock} / {item.max_stock} {item.unit}
                      </td>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        ${item.cost_per_unit.toFixed(2)}/{item.unit}
                      </td>
                      <td className={`py-4 px-6 font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        ${(item.current_stock * item.cost_per_unit).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(item.status)}
                            <span className="capitalize">{item.status.replace('-', ' ')}</span>
                          </div>
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowAddModal(true);
                            }}
                            className={`p-2 rounded-lg ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                            } transition-colors duration-200`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deductInventory(item.id, 1)}
                            className={`p-2 rounded-lg ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                            } transition-colors duration-200`}
                          >
                            <TrendingDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteConfirm(true);
                            }}
                            className={`p-2 rounded-lg ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-error-500' 
                                : 'hover:bg-gray-100 text-error-500'
                            } transition-colors duration-200`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredInventory.length === 0 && (
                    <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <td colSpan={8} className="py-4 px-6 text-center">
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          No inventory items found. Adjust your filters or add new items.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Deductions Tab */}
      {activeTab === 'deductions' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Real-time Inventory Deductions
            </h3>
            
            <div className="space-y-4">
              {deductions.length > 0 ? (
                deductions.map((deduction) => (
                  <div key={deduction.id} className={`p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <div className="flex justify-between">
                      <div>
                        <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {deduction.itemName || 'Unknown Item'}
                        </h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Order: {deduction.orderId} • Reason: {deduction.reason.replace('-', ' ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          -{deduction.quantity} {deduction.unit}
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {deduction.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No deductions have been recorded yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stock Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Stock Alerts & Notifications
            </h3>
            
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.severity === 'high' 
                      ? 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-800' 
                      : alert.severity === 'medium'
                      ? 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800'
                      : 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                        alert.severity === 'high' ? 'text-error-500' : 
                        alert.severity === 'medium' ? 'text-warning-500' : 'text-blue-500'
                      }`} />
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          alert.severity === 'high' ? 'text-error-800 dark:text-error-300' : 
                          alert.severity === 'medium' ? 'text-warning-800 dark:text-warning-300' : 'text-blue-800 dark:text-blue-300'
                        }`}>
                          {alert.type.replace('-', ' ').toUpperCase()}
                        </h4>
                        <p className={`text-sm ${
                          alert.severity === 'high' ? 'text-error-600 dark:text-error-400' : 
                          alert.severity === 'medium' ? 'text-warning-600 dark:text-warning-400' : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {alert.message}
                        </p>
                        <div className="mt-2 flex justify-between items-center">
                          <p className={`text-xs ${
                            alert.severity === 'high' ? 'text-error-500 dark:text-error-500' : 
                            alert.severity === 'medium' ? 'text-warning-500 dark:text-warning-500' : 'text-blue-500 dark:text-blue-500'
                          }`}>
                            {alert.timestamp.toLocaleDateString()} {alert.timestamp.toLocaleTimeString()}
                          </p>
                          <button 
                            className={`text-xs px-2 py-1 rounded ${
                              alert.severity === 'high' ? 'bg-error-600 hover:bg-error-700' : 
                              alert.severity === 'medium' ? 'bg-warning-600 hover:bg-warning-700' : 'bg-blue-600 hover:bg-blue-700'
                            } text-white`}
                            onClick={() => {
                              // Find the inventory item and open the edit modal
                              const item = inventoryItems.find(i => i.id === alert.itemId);
                              if (item) {
                                setSelectedItem(item);
                                setShowAddModal(true);
                              }
                            }}
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-3" />
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    No alerts at this time
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    All inventory items are at healthy levels
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 max-h-screen overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <InventoryItemForm 
              initialData={selectedItem}
              onSave={handleSaveItem}
              onCancel={() => setShowAddModal(false)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6`}>
            <h3 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Confirm Deletion
            </h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete "{selectedItem.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-error-500 text-white hover:bg-error-600 disabled:bg-gray-400"
              >
                {isLoading ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventorySystem;