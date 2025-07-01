import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  ChefHat,
  Clock,
  DollarSign,
  List,
  Tag,
  Plus,
  Minus,
  Package
} from 'lucide-react';
import { useMenu } from '../../hooks/useMenu';
import { useInventory } from '../../hooks/useInventory';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../utils/supabase';

interface MenuItemFormProps {
  initialData?: any;
  onSave: () => void;
  onCancel: () => void;
}

const MenuItemForm: React.FC<MenuItemFormProps> = ({ initialData, onSave, onCancel }) => {
  const { addMenuItem, updateMenuItem, menuCategories } = useMenu();
  const { inventoryItems, fetchInventory } = useInventory();
  const { theme } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    available: true,
    preparation_time: 0,
    allergens: [] as string[],
    tags: [] as string[]
  });

  const [ingredients, setIngredients] = useState<any[]>([]);
  const [costPrice, setCostPrice] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);
  
  const categories = [...new Set(['Main Course', 'Appetizers', 'Desserts', 'Beverages', 'Salads', 'Snacks', ...menuCategories])];
  const allergenOptions = ['Gluten', 'Dairy', 'Nuts', 'Eggs', 'Soy', 'Fish', 'Shellfish', 'Sesame', 'Mustard', 'Celery', 'Sulphites'];
  const tagOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Spicy', 'Chef Special', 'Popular', 'New', 'Low Calorie', 'High Protein'];
  
  useEffect(() => {
    // Fetch inventory items for ingredient selection
    fetchInventory();
    
    if (initialData) {
      // Set basic form data
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        category: initialData.category || '',
        image_url: initialData.image_url || '',
        available: initialData.available ?? true,
        preparation_time: initialData.preparation_time || 0,
        allergens: initialData.allergens || [],
        tags: initialData.tags || []
      });
      
      // If editing an existing item, fetch its ingredients
      if (initialData.id) {
        fetchMenuIngredients(initialData.id);
      }
    }
  }, [initialData]);
  
  // Fetch menu item ingredients
  const fetchMenuIngredients = async (menuItemId: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_ingredients')
        .select(`
          id,
          inventory_item_id,
          quantity,
          unit,
          is_optional,
          inventory_item:inventory_items(name, unit, cost_per_unit)
        `)
        .eq('menu_item_id', menuItemId);
      
      if (error) throw error;
      
      if (data) {
        setIngredients(data.map(item => ({
          id: item.id,
          inventoryItemId: item.inventory_item_id,
          name: item.inventory_item?.name || 'Unknown',
          quantity: item.quantity,
          unit: item.unit || item.inventory_item?.unit,
          isOptional: item.is_optional,
          costPerUnit: item.inventory_item?.cost_per_unit || 0
        })));
        
        // Calculate cost price based on ingredients
        calculateCostPrice(data);
      }
    } catch (error) {
      console.error('Error fetching menu ingredients:', error);
    }
  };
  
  const calculateCostPrice = (ingredientsList = ingredients) => {
    const totalCost = ingredientsList.reduce((sum, ingredient) => {
      const cost = ingredient.quantity * (ingredient.costPerUnit || 0);
      return sum + cost;
    }, 0);
    
    setCostPrice(totalCost);
    
    // Calculate profit margin
    if (formData.price > 0 && totalCost > 0) {
      const margin = ((formData.price - totalCost) / formData.price) * 100;
      setProfitMargin(margin);
    } else {
      setProfitMargin(0);
    }
  };
  
  useEffect(() => {
    calculateCostPrice();
  }, [ingredients, formData.price]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
  };
  
  const handleArrayChange = (field: 'allergens' | 'tags', value: string) => {
    setFormData(prev => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value]
      };
    });
  };
  
  const addIngredient = (inventoryItem: any) => {
    // Check if item is already added
    if (ingredients.some(ing => ing.inventoryItemId === inventoryItem.id)) {
      alert('This ingredient is already added to the recipe');
      return;
    }
    
    // Add new ingredient to list
    const newIngredient = {
      id: `temp-${Date.now()}`,
      inventoryItemId: inventoryItem.id,
      name: inventoryItem.name,
      quantity: 1, // Default quantity
      unit: inventoryItem.unit,
      isOptional: false,
      costPerUnit: inventoryItem.cost_per_unit
    };
    
    setIngredients(prev => [...prev, newIngredient]);
    setShowIngredientSelector(false);
  };
  
  const updateIngredientQuantity = (id: string, quantity: number) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, quantity } : ing
    ));
  };
  
  const toggleIngredientOptional = (id: string) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...ing, isOptional: !ing.isOptional } : ing
    ));
  };
  
  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };
  
  // Convert units if needed
  const convertUnitIfNeeded = (quantity: number, fromUnit: string, toUnit: string) => {
    if (fromUnit === toUnit) return quantity;
    
    // Weight conversions
    if (fromUnit === 'kg' && toUnit === 'g') return quantity * 1000;
    if (fromUnit === 'g' && toUnit === 'kg') return quantity / 1000;
    
    // Volume conversions
    if (fromUnit === 'L' && toUnit === 'ml') return quantity * 1000;
    if (fromUnit === 'ml' && toUnit === 'L') return quantity / 1000;
    
    // Count conversions
    if (fromUnit === 'dozen' && toUnit === 'pcs') return quantity * 12;
    if (fromUnit === 'pcs' && toUnit === 'dozen') return quantity / 12;
    
    // No conversion possible or needed
    return quantity;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Prepare menu item data
      const menuItemData = {
        ...formData,
        // Convert empty strings to null
        description: formData.description || null,
        image_url: formData.image_url || null,
      };
      
      let menuItemId: string;
      
      if (initialData?.id) {
        // Update existing menu item
        const result = await updateMenuItem(initialData.id, menuItemData);
        if (!result) throw new Error('Failed to update menu item');
        menuItemId = initialData.id;
      } else {
        // Add new menu item
        const result = await addMenuItem(menuItemData);
        if (!result) throw new Error('Failed to add menu item');
        menuItemId = result.id;
      }
      
      // Save ingredients if we have any
      if (ingredients.length > 0) {
        // For existing menu item, first delete all existing ingredients
        if (initialData?.id) {
          const { error: deleteError } = await supabase
            .from('menu_ingredients')
            .delete()
            .eq('menu_item_id', menuItemId);
          
          if (deleteError) throw deleteError;
        }
        
        // Then insert all current ingredients
        const ingredientsToInsert = ingredients.map(ing => ({
          menu_item_id: menuItemId,
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
      
      onSave();
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('An error occurred while saving the menu item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <ChefHat className="w-5 h-5 mr-2" />
            Basic Information
          </h4>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Item Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Price* ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Category*
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Preparation Time (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  type="number"
                  name="preparation_time"
                  value={formData.preparation_time}
                  onChange={handleChange}
                  min="0"
                  className="w-full pl-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Available
              </label>
              <div className="flex items-center h-10">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="available"
                    checked={formData.available}
                    onChange={e => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    Item is available for ordering
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Image URL
            </label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter a URL for the menu item's image
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <List className="w-5 h-5 mr-2" />
            Additional Details
          </h4>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Allergens
            </label>
            <div className="flex flex-wrap gap-2">
              {allergenOptions.map((allergen) => (
                <label
                  key={allergen}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer border ${
                    formData.allergens.includes(allergen)
                      ? 'bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-700'
                      : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.allergens.includes(allergen)}
                    onChange={() => handleArrayChange('allergens', allergen)}
                  />
                  {allergen}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <label
                  key={tag}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer border ${
                    formData.tags.includes(tag)
                      ? 'bg-secondary-100 text-secondary-800 border-secondary-300 dark:bg-secondary-900/30 dark:text-secondary-400 dark:border-secondary-700'
                      : 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={formData.tags.includes(tag)}
                    onChange={() => handleArrayChange('tags', tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </div>
          
          {/* Ingredients Section */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Ingredients
              </h4>
              <button 
                type="button"
                onClick={() => setShowIngredientSelector(!showIngredientSelector)}
                className="px-2 py-1 text-sm bg-primary-500 text-white rounded flex items-center hover:bg-primary-600"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Ingredient
              </button>
            </div>
            
            {/* Ingredient Selector */}
            {showIngredientSelector && (
              <div className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select an ingredient to add
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 mb-2">
                  {inventoryItems.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => addIngredient(item)}
                      className="p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.current_stock} {item.unit} available • ${item.cost_per_unit}/{item.unit}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-primary-500" />
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setShowIngredientSelector(false)}
                >
                  Cancel
                </button>
              </div>
            )}
            
            {/* Ingredients List */}
            {ingredients.length > 0 ? (
              <div className="space-y-3">
                {ingredients.map(ing => (
                  <div 
                    key={ing.id} 
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{ing.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${ing.costPerUnit}/{ing.unit} • Total: ${(ing.quantity * ing.costPerUnit).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <button 
                          type="button" 
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full"
                          onClick={() => updateIngredientQuantity(ing.id, Math.max(0.1, ing.quantity - 0.1))}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={ing.quantity}
                          onChange={(e) => updateIngredientQuantity(ing.id, parseFloat(e.target.value) || 0)}
                          className="w-16 text-center px-1 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700"
                          min="0.1"
                          step="0.1"
                        />
                        <span className="text-sm">{ing.unit}</span>
                        <button 
                          type="button" 
                          className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full"
                          onClick={() => updateIngredientQuantity(ing.id, ing.quantity + 0.1)}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <label className="flex items-center space-x-1 text-sm">
                        <input
                          type="checkbox"
                          checked={ing.isOptional}
                          onChange={() => toggleIngredientOptional(ing.id)}
                          className="rounded text-primary-500"
                        />
                        <span>Optional</span>
                      </label>
                      <button 
                        type="button" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeIngredient(ing.id)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Cost Calculation */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Cost Price:</div>
                    <div className="font-semibold">${costPrice.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Selling Price:</div>
                    <div className="font-semibold">${formData.price.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Profit Margin:</div>
                    <div className={`font-semibold ${
                      profitMargin > 50 ? 'text-green-600' : 
                      profitMargin > 20 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {profitMargin.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <Package className="w-10 h-10 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No ingredients added yet. Click "Add Ingredient" to get started.
                </p>
              </div>
            )}
          </div>
          
          {formData.image_url && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Image Preview
              </label>
              <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <img 
                  src={formData.image_url} 
                  alt={formData.name} 
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <span className="flex items-center">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span className="flex items-center">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default MenuItemForm;