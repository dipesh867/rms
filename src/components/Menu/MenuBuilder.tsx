import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Package, 
  DollarSign, 
  Clock, 
  Eye, 
  Copy,
  Upload,
  Download,
  Settings,
  AlertCircle,
  CheckCircle,
  X,
  Save
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useMenu } from '../../hooks/useMenu';
import { useInventory } from '../../hooks/useInventory';
import { supabase } from '../../utils/supabase';
import MenuItemForm from './MenuItemForm';

const MenuBuilder: React.FC = () => {
  const { theme } = useApp();
  const { menuItems, menuCategories, fetchMenu } = useMenu();
  const { fetchInventory } = useInventory();
  const [activeTab, setActiveTab] = useState<'menu' | 'categories' | 'ingredients' | 'pricing'>('menu');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch menu and inventory on mount
  useEffect(() => {
    fetchMenu();
    fetchInventory();
  }, []);

  const categories = ['All', ...menuCategories];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = () => {
    setSelectedItem(null);
    setShowAddModal(true);
  };

  const handleEditItem = (item: any) => {
    setSelectedItem(item);
    setShowAddModal(true);
  };

  const handleViewItem = async (item: any) => {
    try {
      // Get the menu item with ingredients
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', item.id)
        .single();
        
      if (menuError) throw menuError;
      
      // Get ingredients
      const { data: ingredients, error: ingredientError } = await supabase
        .from('menu_ingredients')
        .select(`
          *,
          inventory_item:inventory_items(*)
        `)
        .eq('menu_item_id', item.id);
      
      if (ingredientError) throw ingredientError;
      
      // Create a detailed menu item object
      const detailedItem = {
        ...menuData,
        ingredients: ingredients || []
      };
      
      setSelectedItem(detailedItem);
      
      // Just view the item, don't show the edit form
      // Here you could show a different modal for viewing
    } catch (error) {
      console.error('Error getting menu item details:', error);
      alert('Failed to load menu item details');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      setIsLoading(true);
      
      // First delete all menu ingredients
      const { error: ingredientError } = await supabase
        .from('menu_ingredients')
        .delete()
        .eq('menu_item_id', id);
      
      if (ingredientError) throw ingredientError;
      
      // Then delete the menu item
      const { error: itemError } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
      
      if (itemError) throw itemError;
      
      // Refresh the menu
      await fetchMenu();
      
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveItem = () => {
    setShowAddModal(false);
    fetchMenu(); // Refresh the menu list
  };

  const calculateItemCost = async (itemId: string): Promise<{ cost: number, margin: number }> => {
    try {
      // Fetch ingredients for the menu item
      const { data, error } = await supabase
        .from('menu_ingredients')
        .select(`
          quantity,
          inventory_item:inventory_items(cost_per_unit)
        `)
        .eq('menu_item_id', itemId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) return { cost: 0, margin: 0 };
      
      // Calculate total cost
      const totalCost = data.reduce((sum, item) => {
        return sum + (item.quantity * (item.inventory_item?.cost_per_unit || 0));
      }, 0);
      
      // Find the menu item to calculate profit margin
      const menuItem = menuItems.find(item => item.id === itemId);
      if (!menuItem) return { cost: totalCost, margin: 0 };
      
      // Calculate profit margin
      const margin = menuItem.price > 0 ? ((menuItem.price - totalCost) / menuItem.price) * 100 : 0;
      
      return {
        cost: totalCost,
        margin: margin
      };
    } catch (error) {
      console.error('Error calculating item cost:', error);
      return { cost: 0, margin: 0 };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Menu Builder
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage menu items with ingredient linking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Upload className="w-4 h-4" />
            <span>Import Menu</span>
          </button>
          <button
            onClick={handleAddItem}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {[
            { id: 'menu', label: 'Menu Items', icon: Package },
            { id: 'categories', label: 'Categories', icon: Filter },
            { id: 'ingredients', label: 'Ingredient Links', icon: Settings },
            { id: 'pricing', label: 'Pricing Analysis', icon: DollarSign }
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

      {/* Menu Items Tab */}
      {activeTab === 'menu' && (
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
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredMenuItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map((item) => {
                // Dynamic cost calculation
                const [itemCost, setItemCost] = useState(0);
                const [profitMargin, setProfitMargin] = useState(0);
                
                // Fetch cost when the component renders
                useEffect(() => {
                  const fetchCost = async () => {
                    const { cost, margin } = await calculateItemCost(item.id);
                    setItemCost(cost);
                    setProfitMargin(margin);
                  };
                  
                  fetchCost();
                }, [item.id]);
                
                return (
                  <div key={item.id} className={`p-6 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  } shadow-lg hover:shadow-xl transition-all duration-300`}>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {item.available ? (
                            <CheckCircle className="w-4 h-4 text-success-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-error-500" />
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description || 'No description available'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {item.preparation_time || '0'}m
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Cost: ${itemCost.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className={`text-sm ${
                            profitMargin > 50 ? 'text-success-500' :
                            profitMargin > 30 ? 'text-warning-500' : 'text-error-500'
                          }`}>
                            Margin: {profitMargin.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.allergens.map((allergen: string, idx: number) => (
                            <span 
                              key={idx} 
                              className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full"
                            >
                              {allergen}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleViewItem(item)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Eye className="w-4 h-4 mx-auto" />
                        </button>
                        <button 
                          onClick={() => handleEditItem(item)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          <Edit className="w-4 h-4 mx-auto" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setShowDeleteConfirm(true);
                          }}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-600 text-error-500'
                              : 'bg-gray-100 hover:bg-gray-200 text-error-500'
                          }`}
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                        <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          theme === 'dark'
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}>
                          <Copy className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className={`text-xl font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                No Menu Items Found
              </h3>
              <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm || selectedCategory !== 'all' 
                  ? 'No items match your search criteria. Try adjusting your filters.'
                  : 'Get started by adding your first menu item.'}
              </p>
              <button
                onClick={handleAddItem}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Menu Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 max-h-screen overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}
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

            <MenuItemForm 
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
                onClick={() => handleDeleteItem(selectedItem.id)}
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

export default MenuBuilder;