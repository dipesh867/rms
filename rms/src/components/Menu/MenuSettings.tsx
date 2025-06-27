import React, { useState, useEffect } from 'react';
import {
  Save,
  Settings,
  Package,
  Tag,
  PlusCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
}

interface MenuSettings {
  allowCustomizations: boolean;
  autoUpdatePrices: boolean;
  showOutOfStockItems: boolean;
  enableSpecialInstructions: boolean;
  showPrepTime: boolean;
  categories: Category[];
  defaultPrepTime: number;
  autoDeductInventory: boolean;
  showNutritionInfo: boolean;
}

const MenuSettings: React.FC = () => {
  const { theme } = useApp();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState<MenuSettings>({
    allowCustomizations: true,
    autoUpdatePrices: false,
    showOutOfStockItems: false,
    enableSpecialInstructions: true,
    showPrepTime: true,
    categories: [],
    defaultPrepTime: 15,
    autoDeductInventory: true,
    showNutritionInfo: false
  });
  
  const [newCategory, setNewCategory] = useState('');

  // Load settings on mount
  useEffect(() => {
    const loadMenuSettings = async () => {
      if (!user?.restaurant_id) {
        toast.error('No restaurant associated with your account');
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch menu settings
        const { data, error } = await supabase
          .from('menu_settings')
          .select('*')
          .eq('restaurant_id', user.restaurant_id)
          .single();
        
        if (error && error.code !== 'PGSQL_ERROR') {
          console.error('Error fetching menu settings:', error);
        }
        
        // If settings exist, use them
        if (data) {
          setSettings({
            allowCustomizations: data.allow_customizations,
            autoUpdatePrices: data.auto_update_prices,
            showOutOfStockItems: data.show_out_of_stock_items,
            enableSpecialInstructions: data.enable_special_instructions,
            showPrepTime: data.show_prep_time,
            categories: data.categories || [],
            defaultPrepTime: data.default_prep_time || 15,
            autoDeductInventory: data.auto_deduct_inventory,
            showNutritionInfo: data.show_nutrition_info
          });
        }
        
        // Also fetch categories from menu_categories table
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('id, name')
          .eq('restaurant_id', user.restaurant_id)
          .order('name');
        
        if (categoriesError) {
          console.error('Error fetching menu categories:', categoriesError);
        } else if (categoriesData) {
          setSettings(prev => ({
            ...prev,
            categories: categoriesData
          }));
        }
      } catch (error) {
        console.error('Error loading menu settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMenuSettings();
  }, [user]);

  // Handle settings change
  const handleSettingChange = (key: keyof MenuSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  // Add new category
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    
    // Check if category already exists
    if (settings.categories.some(cat => cat.name.toLowerCase() === newCategory.toLowerCase())) {
      toast.error('Category already exists');
      return;
    }
    
    // Add new category
    setSettings(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        { id: `temp-${Date.now()}`, name: newCategory.trim() }
      ]
    }));
    setNewCategory('');
    setHasChanges(true);
  };

  // Remove category
  const handleRemoveCategory = (id: string) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== id)
    }));
    setHasChanges(true);
  };

  // Save settings
  const saveSettings = async () => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Save menu settings
      const { error: settingsError } = await supabase
        .from('menu_settings')
        .upsert({
          restaurant_id: user.restaurant_id,
          allow_customizations: settings.allowCustomizations,
          auto_update_prices: settings.autoUpdatePrices,
          show_out_of_stock_items: settings.showOutOfStockItems,
          enable_special_instructions: settings.enableSpecialInstructions,
          show_prep_time: settings.showPrepTime,
          default_prep_time: settings.defaultPrepTime,
          auto_deduct_inventory: settings.autoDeductInventory,
          show_nutrition_info: settings.showNutritionInfo
        });
      
      if (settingsError) throw settingsError;
      
      // Save categories
      // First, handle new categories (those without a valid UUID)
      const newCategories = settings.categories.filter(cat => cat.id.startsWith('temp-'));
      
      if (newCategories.length > 0) {
        const categoriesToInsert = newCategories.map(cat => ({
          restaurant_id: user.restaurant_id,
          name: cat.name
        }));
        
        const { error: insertError } = await supabase
          .from('menu_categories')
          .insert(categoriesToInsert);
        
        if (insertError) throw insertError;
      }
      
      // Then, handle deleted categories (by comparing with what we had initially)
      // This is a bit more complex and would require tracking the initial categories
      // For simplicity, we'll reload the categories after saving
      
      toast.success('Menu settings saved successfully');
      setHasChanges(false);
      
      // Reload categories to get the updated list with proper IDs
      const { data: categoriesData } = await supabase
        .from('menu_categories')
        .select('id, name')
        .eq('restaurant_id', user.restaurant_id)
        .order('name');
      
      if (categoriesData) {
        setSettings(prev => ({
          ...prev,
          categories: categoriesData
        }));
      }
    } catch (error) {
      console.error('Error saving menu settings:', error);
      toast.error('Failed to save menu settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user?.restaurant_id) {
    return (
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 mx-auto text-error-500 mb-4" />
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No Restaurant Associated
          </h3>
          <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Your account is not associated with any restaurant.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Menu Settings
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure how your menu is displayed and how items are managed
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-warning-600 text-sm font-medium">
              Unsaved Changes
            </span>
          )}
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Menu Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Settings className="w-5 h-5 mr-2" />
            General Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Allow Item Customizations
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.allowCustomizations}
                  onChange={(e) => handleSettingChange('allowCustomizations', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Auto-Update Prices From Costs
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.autoUpdatePrices}
                  onChange={(e) => handleSettingChange('autoUpdatePrices', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Show Out-Of-Stock Items
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.showOutOfStockItems}
                  onChange={(e) => handleSettingChange('showOutOfStockItems', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Enable Special Instructions
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.enableSpecialInstructions}
                  onChange={(e) => handleSettingChange('enableSpecialInstructions', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Show Preparation Time
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.showPrepTime}
                  onChange={(e) => handleSettingChange('showPrepTime', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Show Nutrition Information
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.showNutritionInfo}
                  onChange={(e) => handleSettingChange('showNutritionInfo', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Auto-Deduct Inventory
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.autoDeductInventory}
                  onChange={(e) => handleSettingChange('autoDeductInventory', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="mt-4">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Default Preparation Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={settings.defaultPrepTime}
                onChange={(e) => handleSettingChange('defaultPrepTime', parseInt(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>
          </div>
        </div>

        {/* Category Management */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-5 h-5 mr-2" />
            Menu Categories
          </h3>
          
          <div className="space-y-4">
            {/* Add category */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className={`flex-1 px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              <button
                onClick={handleAddCategory}
                className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* Categories list */}
            <div className={`mt-4 p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Current Categories
              </h4>
              
              {settings.categories.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {settings.categories.map((category) => (
                    <div 
                      key={category.id}
                      className={`flex items-center justify-between p-2 rounded ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center">
                        <Tag className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                          {category.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveCategory(category.id)}
                        className="text-error-500 hover:text-error-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No categories added yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuSettings;