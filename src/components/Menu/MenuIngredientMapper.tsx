import React, { useState, useEffect } from 'react';
import { 
  PackageOpen,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Edit,
  Trash2,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useMenu } from '../../hooks/useMenu';
import { useInventory } from '../../hooks/useInventory';
import { supabase } from '../../utils/supabase';
import { MenuItem } from '../../types';

interface MenuIngredient {
  id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  is_optional: boolean;
  inventory_item?: {
    name: string;
    cost_per_unit: number;
    current_stock: number;
    unit: string;
  };
}

interface Recipe {
  menuItemId: string;
  menuItem: MenuItem;
  ingredients: {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    subtotal: number;
    isOptional: boolean;
    inventoryItemId: string;
  }[];
  totalCost: number;
  sellingPrice: number;
  profitMargin: number;
}

const MenuIngredientMapper: React.FC = () => {
  const { theme } = useApp();
  const { menuItems, fetchMenu } = useMenu();
  const { inventoryItems, fetchInventory, convertUnit } = useInventory();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch menu and inventory
  useEffect(() => {
    fetchMenu();
    fetchInventory();
  }, []);

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory.toLowerCase() === 'all' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const selectMenuItem = async (menuItem: MenuItem) => {
    setIsLoading(true);
    setSelectedMenuItem(menuItem);
    
    try {
      // Fetch recipe (menu ingredients) for this menu item
      const { data, error } = await supabase
        .from('menu_ingredients')
        .select(`
          id,
          menu_item_id,
          inventory_item_id,
          quantity,
          unit,
          is_optional,
          inventory_item:inventory_items(id, name, unit, cost_per_unit, current_stock)
        `)
        .eq('menu_item_id', menuItem.id);
      
      if (error) throw error;
      
      // Transform the data into our Recipe format
      const ingredients = data?.map(ing => ({
        id: ing.id,
        inventoryItemId: ing.inventory_item_id,
        name: ing.inventory_item?.name || 'Unknown Ingredient',
        quantity: ing.quantity,
        unit: ing.unit || ing.inventory_item?.unit || '',
        costPerUnit: ing.inventory_item?.cost_per_unit || 0,
        subtotal: ing.quantity * (ing.inventory_item?.cost_per_unit || 0),
        isOptional: ing.is_optional
      })) || [];
      
      // Calculate total cost
      const totalCost = ingredients.reduce((sum, ing) => sum + ing.subtotal, 0);
      
      // Calculate profit margin
      const profitMargin = totalCost > 0 ? 
        ((menuItem.price - totalCost) / menuItem.price) * 100 : 
        100; // If cost is 0, profit is 100%
      
      const recipe: Recipe = {
        menuItemId: menuItem.id,
        menuItem,
        ingredients,
        totalCost,
        sellingPrice: menuItem.price,
        profitMargin
      };
      
      setSelectedRecipe(recipe);
    } catch (error) {
      console.error('Error fetching menu ingredients:', error);
      toast.error('Failed to load recipe details');
      
      // Create empty recipe if we couldn't load one
      setSelectedRecipe({
        menuItemId: menuItem.id,
        menuItem,
        ingredients: [],
        totalCost: 0,
        sellingPrice: menuItem.price,
        profitMargin: 100
      });
    } finally {
      setIsLoading(false);
      setEditMode(false);
    }
  };

  const startEditing = () => {
    setEditMode(true);
  };

  const cancelEditing = () => {
    // Reload the recipe to discard changes
    if (selectedMenuItem) {
      selectMenuItem(selectedMenuItem);
    }
    setEditMode(false);
  };

  const saveRecipe = async () => {
    if (!selectedRecipe || !selectedMenuItem) return;
    
    try {
      setIsSaving(true);
      
      // First, delete all existing ingredients for this menu item
      const { error: deleteError } = await supabase
        .from('menu_ingredients')
        .delete()
        .eq('menu_item_id', selectedRecipe.menuItemId);
      
      if (deleteError) throw deleteError;
      
      // Then insert all the current ingredients
      if (selectedRecipe.ingredients.length > 0) {
        const ingredientsToInsert = selectedRecipe.ingredients.map(ing => ({
          menu_item_id: selectedRecipe.menuItemId,
          inventory_item_id: ing.inventoryItemId,
          quantity: ing.quantity,
          unit: ing.unit,
          is_optional: ing.isOptional
        }));
        
        const { error: insertError } = await supabase
          .from('menu_ingredients')
          .insert(ingredientsToInsert);
        
        if (insertError) throw insertError;
      }
      
      toast.success('Recipe saved successfully');
      setEditMode(false);
      
      // Refresh the recipe
      await selectMenuItem(selectedMenuItem);
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe');
    } finally {
      setIsSaving(false);
    }
  };

  const addIngredient = (inventoryItem: any) => {
    if (!selectedRecipe || !editMode) return;
    
    // Check if ingredient already exists
    if (selectedRecipe.ingredients.some(ing => ing.inventoryItemId === inventoryItem.id)) {
      toast.error('This ingredient is already in the recipe');
      return;
    }
    
    const newIngredient = {
      id: `temp-${Date.now()}`,
      inventoryItemId: inventoryItem.id,
      name: inventoryItem.name,
      quantity: 1, // Default quantity
      unit: inventoryItem.unit,
      costPerUnit: inventoryItem.cost_per_unit,
      subtotal: 1 * inventoryItem.cost_per_unit,
      isOptional: false
    };
    
    setSelectedRecipe({
      ...selectedRecipe,
      ingredients: [...selectedRecipe.ingredients, newIngredient],
      totalCost: selectedRecipe.totalCost + newIngredient.subtotal,
      profitMargin: calculateProfitMargin(
        selectedRecipe.sellingPrice, 
        selectedRecipe.totalCost + newIngredient.subtotal
      )
    });
  };

  const removeIngredient = (id: string) => {
    if (!selectedRecipe || !editMode) return;
    
    const ingredientToRemove = selectedRecipe.ingredients.find(ing => ing.id === id);
    if (!ingredientToRemove) return;
    
    const newIngredients = selectedRecipe.ingredients.filter(ing => ing.id !== id);
    const newTotalCost = selectedRecipe.totalCost - ingredientToRemove.subtotal;
    
    setSelectedRecipe({
      ...selectedRecipe,
      ingredients: newIngredients,
      totalCost: newTotalCost,
      profitMargin: calculateProfitMargin(selectedRecipe.sellingPrice, newTotalCost)
    });
  };

  const updateIngredientQuantity = (id: string, quantity: number) => {
    if (!selectedRecipe || !editMode) return;
    
    const updatedIngredients = selectedRecipe.ingredients.map(ing => {
      if (ing.id === id) {
        const subtotal = quantity * ing.costPerUnit;
        return { ...ing, quantity, subtotal };
      }
      return ing;
    });
    
    const newTotalCost = updatedIngredients.reduce((sum, ing) => sum + ing.subtotal, 0);
    
    setSelectedRecipe({
      ...selectedRecipe,
      ingredients: updatedIngredients,
      totalCost: newTotalCost,
      profitMargin: calculateProfitMargin(selectedRecipe.sellingPrice, newTotalCost)
    });
  };

  const toggleOptional = (id: string) => {
    if (!selectedRecipe || !editMode) return;
    
    setSelectedRecipe({
      ...selectedRecipe,
      ingredients: selectedRecipe.ingredients.map(ing => {
        if (ing.id === id) {
          return { ...ing, isOptional: !ing.isOptional };
        }
        return ing;
      })
    });
  };

  const createNewRecipe = (menuItem: MenuItem) => {
    const newRecipe: Recipe = {
      menuItemId: menuItem.id,
      menuItem,
      ingredients: [],
      totalCost: 0,
      sellingPrice: menuItem.price,
      profitMargin: 100 // Initially 100% if there are no costs
    };
    
    setSelectedRecipe(newRecipe);
    setEditMode(true);
  };

  // Calculate profit margin
  const calculateProfitMargin = (sellingPrice: number, cost: number): number => {
    if (cost <= 0) return 100;
    if (sellingPrice <= 0) return 0;
    return ((sellingPrice - cost) / sellingPrice) * 100;
  };

  // Get profitability category
  const getProfitabilityCategory = (profitMargin: number) => {
    if (profitMargin >= 70) return { label: 'Excellent', color: 'text-success-600', icon: <TrendingUp className="w-4 h-4" /> };
    if (profitMargin >= 50) return { label: 'Good', color: 'text-success-600', icon: <TrendingUp className="w-4 h-4" /> };
    if (profitMargin >= 30) return { label: 'Average', color: 'text-warning-600', icon: <TrendingUp className="w-4 h-4" /> };
    return { label: 'Low', color: 'text-error-600', icon: <TrendingDown className="w-4 h-4" /> };
  };

  // Calculate inventory usage based on all menu item recipes
  const calculateInventoryUsage = async () => {
    try {
      // Get all menu ingredients across all menu items
      const { data, error } = await supabase
        .from('menu_ingredients')
        .select(`
          inventory_item_id,
          quantity,
          menu_item:menu_items(id, name)
        `);
      
      if (error) throw error;
      
      // Aggregate by inventory item
      const usageMap = new Map();
      
      data?.forEach(item => {
        const id = item.inventory_item_id;
        if (!usageMap.has(id)) {
          usageMap.set(id, {
            inventoryItemId: id,
            usedInMenuItems: new Set(),
            totalQuantityUsed: 0
          });
        }
        
        const usage = usageMap.get(id);
        usage.usedInMenuItems.add(item.menu_item?.name || 'Unknown Menu');
        usage.totalQuantityUsed += item.quantity;
      });
      
      // Convert to array
      return Array.from(usageMap.values()).map(usage => ({
        ...usage,
        usedInMenuItems: Array.from(usage.usedInMenuItems)
      }));
    } catch (error) {
      console.error('Error calculating inventory usage:', error);
      return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Menu & Ingredient Mapping
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Link menu items to inventory for cost tracking and auto-deduction
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Menu Items List */}
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg h-full flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Menu Items
              </h3>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}>
                  {menuItems.length} Items
                </span>
              </div>
            </div>
            
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
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

            <div className="overflow-y-auto flex-1 space-y-3">
              {filteredMenuItems.map((item) => {
                const hasRecipe = async () => {
                  const { count } = await supabase
                    .from('menu_ingredients')
                    .select('*', { count: 'exact', head: true })
                    .eq('menu_item_id', item.id);
                  return count && count > 0;
                };
                
                // State for tracking if this item has a recipe
                const [hasIngredients, setHasIngredients] = useState<boolean | null>(null);
                
                // Check if this menu item has ingredients
                useEffect(() => {
                  hasRecipe().then(setHasIngredients);
                }, [item.id]);
                
                return (
                  <div 
                    key={item.id}
                    onClick={() => selectMenuItem(item)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedMenuItem?.id === item.id
                        ? theme === 'dark'
                          ? 'border-primary-500 bg-primary-900/20'
                          : 'border-primary-500 bg-primary-50'
                        : theme === 'dark'
                          ? 'border-gray-700 bg-gray-700 hover:border-gray-600'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-medium text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.name}
                        </h4>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.category}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${item.price.toFixed(2)}
                        </span>
                        {hasIngredients === null ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Loading...
                          </span>
                        ) : hasIngredients ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 mt-1">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mapped
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 mt-1">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Not Mapped
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {filteredMenuItems.length === 0 && (
                <div className="text-center py-8">
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No menu items found. Adjust your filters or add menu items first.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recipe Details */}
        <div className="lg:col-span-2">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg h-full flex flex-col`}>
            {selectedMenuItem ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedMenuItem.name}
                    </h3>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedMenuItem.description || 'No description available'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {editMode ? (
                      <>
                        <button
                          onClick={saveRecipe}
                          disabled={isSaving}
                          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isSaving ? 'Saving...' : 'Save Recipe'}</span>
                        </button>
                        <button
                          onClick={cancelEditing}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-700 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={startEditing}
                          className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          disabled={!selectedRecipe || isLoading}
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit Recipe</span>
                        </button>
                        {!selectedRecipe && !isLoading && (
                          <button
                            onClick={() => createNewRecipe(selectedMenuItem)}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Create Recipe</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                  </div>
                ) : selectedRecipe ? (
                  <div className="flex-1 flex flex-col">
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Cost Price
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${selectedRecipe.totalCost.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Selling Price
                        </div>
                        <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${selectedRecipe.sellingPrice.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Profit Margin
                        </div>
                        <div className={`text-xl font-bold flex items-center ${
                          getProfitabilityCategory(selectedRecipe.profitMargin).color
                        }`}>
                          {getProfitabilityCategory(selectedRecipe.profitMargin).icon}
                          <span className="ml-1">{selectedRecipe.profitMargin.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      <div className="mb-4 flex justify-between items-center">
                        <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Ingredient List
                        </h4>
                        {editMode && (
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            Click an inventory item below to add to recipe
                          </div>
                        )}
                      </div>
                      
                      <table className="w-full">
                        <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <tr>
                            <th className={`text-left py-3 px-4 font-medium text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>Ingredient</th>
                            <th className={`text-left py-3 px-4 font-medium text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>Quantity</th>
                            <th className={`text-left py-3 px-4 font-medium text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>Cost/Unit</th>
                            <th className={`text-left py-3 px-4 font-medium text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>Subtotal</th>
                            <th className={`text-left py-3 px-4 font-medium text-sm ${
                              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>Optional</th>
                            {editMode && (
                              <th className={`text-right py-3 px-4 font-medium text-sm ${
                                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                              }`}>Actions</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRecipe.ingredients.length > 0 ? (
                            selectedRecipe.ingredients.map((ingredient) => (
                              <tr key={ingredient.id} className={`border-b ${
                                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                              }`}>
                                <td className={`py-3 px-4 ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {ingredient.name}
                                </td>
                                <td className="py-3 px-4">
                                  {editMode ? (
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="number"
                                        value={ingredient.quantity}
                                        onChange={(e) => updateIngredientQuantity(ingredient.id, parseFloat(e.target.value) || 0)}
                                        step="0.01"
                                        min="0"
                                        className={`w-20 px-2 py-1 rounded border text-center ${
                                          theme === 'dark'
                                            ? 'bg-gray-700 border-gray-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                      />
                                      <span className={`text-sm ${
                                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                      }`}>{ingredient.unit}</span>
                                    </div>
                                  ) : (
                                    <span className={`${
                                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                    }`}>{ingredient.quantity} {ingredient.unit}</span>
                                  )}
                                </td>
                                <td className={`py-3 px-4 ${
                                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                }`}>
                                  ${ingredient.costPerUnit.toFixed(2)}
                                </td>
                                <td className={`py-3 px-4 font-medium ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  ${ingredient.subtotal.toFixed(2)}
                                </td>
                                <td className="py-3 px-4">
                                  {editMode ? (
                                    <input
                                      type="checkbox"
                                      checked={ingredient.isOptional}
                                      onChange={() => toggleOptional(ingredient.id)}
                                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                  ) : (
                                    <span className={`${
                                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                    }`}>{ingredient.isOptional ? 'Yes' : 'No'}</span>
                                  )}
                                </td>
                                {editMode && (
                                  <td className="py-3 px-4 text-right">
                                    <button
                                      onClick={() => removeIngredient(ingredient.id)}
                                      className="text-error-500 hover:text-error-600"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td colSpan={editMode ? 6 : 5} className="py-4 px-4 text-center">
                                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                  No ingredients added yet. {editMode && 'Add ingredients from the list below.'}
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot>
                          <tr className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                            <td className="py-3 px-4 font-semibold">Total</td>
                            <td colSpan={2} className="py-3 px-4"></td>
                            <td className="py-3 px-4 font-semibold">
                              ${selectedRecipe.totalCost.toFixed(2)}
                            </td>
                            <td colSpan={editMode ? 2 : 1} className="py-3 px-4"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    {editMode && (
                      <div className="mt-6 pt-6 border-t border-gray-700 dark:border-gray-600">
                        <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          Available Ingredients
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                          {inventoryItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => addIngredient(item)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedRecipe.ingredients.some(ing => ing.inventoryItemId === item.id)
                                  ? theme === 'dark'
                                    ? 'border-primary-500 bg-primary-900/20 opacity-50 cursor-not-allowed'
                                    : 'border-primary-500 bg-primary-50 opacity-50 cursor-not-allowed'
                                  : theme === 'dark'
                                    ? 'border-gray-700 hover:border-gray-600 bg-gray-700'
                                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                              }`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {item.name}
                                  </h5>
                                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {item.current_stock} {item.unit} in stock
                                  </p>
                                </div>
                                <div>
                                  <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    ${item.cost_per_unit.toFixed(2)}/{item.unit}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className={`mt-6 p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <h4 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Profitability Analysis
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className={`text-sm font-medium mb-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Food Cost Percentage
                          </div>
                          <div className={`text-lg font-bold ${
                            100 - selectedRecipe.profitMargin > 35 ? 'text-error-600' :
                            100 - selectedRecipe.profitMargin > 25 ? 'text-warning-600' :
                            'text-success-600'
                          }`}>
                            {(100 - selectedRecipe.profitMargin).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className={`text-sm font-medium mb-1 ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            Profit per Unit
                          </div>
                          <div className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            ${(selectedRecipe.sellingPrice - selectedRecipe.totalCost).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <PackageOpen className={`w-16 h-16 mb-4 ${
                      theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                    }`} />
                    <h3 className={`text-xl font-medium mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      No Recipe Found
                    </h3>
                    <p className={`text-sm text-center max-w-md mb-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      This menu item doesn't have an ingredient recipe yet. Create a recipe to track costs, calculate profitability, and enable automatic inventory deduction.
                    </p>
                    <button
                      onClick={() => createNewRecipe(selectedMenuItem)}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Recipe</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <PackageOpen className={`w-16 h-16 mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <h3 className={`text-xl font-medium mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Select a Menu Item
                </h3>
                <p className={`text-sm text-center max-w-md ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Select a menu item from the list to view or edit its recipe and ingredients.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Recipe Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Mapped Menu Items
              </span>
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} id="mapped-count">
                {/* This will be populated via AJAX */}
                Loading...
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Average Profit Margin
              </span>
              <span className={`font-medium text-success-600`} id="avg-margin">
                {/* This will be populated via AJAX */}
                Loading...
              </span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            High Profit Items
          </h3>
          <div className="space-y-1" id="high-profit-items">
            {/* This will be populated via AJAX */}
            <div className="text-center py-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading...
              </span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Most Costly Items
          </h3>
          <div className="space-y-1" id="costly-items">
            {/* This will be populated via AJAX */}
            <div className="text-center py-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading...
              </span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Most Used Ingredients
          </h3>
          <div className="space-y-1" id="used-ingredients">
            {/* This will be populated via AJAX */}
            <div className="text-center py-2">
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Loading...
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Script to populate dashboard widgets */}
      <script dangerouslySetInnerHTML={{
        __html: `
          // Function to fetch recipe stats and update the UI
          async function updateStats() {
            try {
              // Count mapped menu items
              const { count } = await supabase
                .from('menu_ingredients')
                .select('menu_item_id', { count: 'exact', head: true });
                
              document.getElementById('mapped-count').textContent = 
                count + '/' + ${menuItems.length};
                
              // Get all recipes with profit margins
              const { data } = await supabase.rpc('get_menu_profit_margins');
              
              if (data && data.length > 0) {
                // Calculate average margin
                const avgMargin = data.reduce((sum, item) => sum + item.profit_margin, 0) / data.length;
                document.getElementById('avg-margin').textContent = avgMargin.toFixed(1) + '%';
                
                // Sort by profit margin for high profit items
                const highProfitItems = [...data].sort((a, b) => b.profit_margin - a.profit_margin).slice(0, 3);
                const highProfitHtml = highProfitItems.map(item => {
                  return \`
                    <div class="flex justify-between items-center">
                      <span class="text-sm truncate max-w-[120px]">\${item.name}</span>
                      <span class="text-sm font-medium text-success-600">\${item.profit_margin.toFixed(1)}%</span>
                    </div>
                  \`;
                }).join('');
                
                document.getElementById('high-profit-items').innerHTML = highProfitHtml || 'No data available';
                
                // Sort by cost for most costly items
                const costlyItems = [...data].sort((a, b) => b.cost_price - a.cost_price).slice(0, 3);
                const costlyHtml = costlyItems.map(item => {
                  return \`
                    <div class="flex justify-between items-center">
                      <span class="text-sm truncate max-w-[120px]">\${item.name}</span>
                      <span class="text-sm font-medium">$\${item.cost_price.toFixed(2)}</span>
                    </div>
                  \`;
                }).join('');
                
                document.getElementById('costly-items').innerHTML = costlyHtml || 'No data available';
              }
              
              // Get most used ingredients
              const { data: ingredients } = await supabase
                .from('menu_ingredients')
                .select(\`
                  inventory_item_id,
                  inventory_item:inventory_items(name)
                \`)
                .order('inventory_item_id');
                
              if (ingredients && ingredients.length > 0) {
                // Count occurrences of each ingredient
                const ingredientCounts = ingredients.reduce((acc, item) => {
                  const id = item.inventory_item_id;
                  const name = item.inventory_item?.name || 'Unknown';
                  acc[id] = acc[id] || { name, count: 0 };
                  acc[id].count++;
                  return acc;
                }, {});
                
                // Convert to array and sort
                const sortedIngredients = Object.values(ingredientCounts)
                  .sort((a: any, b: any) => b.count - a.count)
                  .slice(0, 3);
                
                const ingredientsHtml = sortedIngredients.map((ing: any) => {
                  return \`
                    <div class="flex justify-between items-center">
                      <span class="text-sm truncate max-w-[120px]">\${ing.name}</span>
                      <span class="text-sm font-medium">\${ing.count} recipes</span>
                    </div>
                  \`;
                }).join('');
                
                document.getElementById('used-ingredients').innerHTML = ingredientsHtml || 'No data available';
              }
            } catch (error) {
              console.error('Error updating stats:', error);
            }
          }
          
          // Update stats on page load
          updateStats();
        `
      }}></script>
    </div>
  );
};

export default MenuIngredientMapper;