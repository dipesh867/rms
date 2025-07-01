import { useState, useEffect, createContext, useContext } from 'react';
import { menuAPI } from '../services/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
  preparation_time: number;
  allergens: string[] | null;
  tags: string[] | null;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

interface MenuIngredient {
  id: string;
  menu_item_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields from inventory_items
  inventory_item?: {
    name: string;
    cost_per_unit: number;
    current_stock: number;
    unit: string;
  };
}

interface NewMenuItem {
  name: string;
  description?: string;
  price: number;
  category: string;
  image_url?: string;
  available?: boolean;
  preparation_time?: number;
  allergens?: string[];
  tags?: string[];
}

interface NewMenuIngredient {
  menu_item_id: string;
  inventory_item_id: string;
  quantity: number;
  unit: string;
  is_optional?: boolean;
}

interface MenuItemWithIngredients extends MenuItem {
  ingredients: MenuIngredient[];
  cost_price?: number;
  profit_margin?: number;
}

interface MenuContextType {
  menuItems: MenuItem[];
  menuCategories: string[];
  isLoading: boolean;
  error: string | null;
  fetchMenu: () => Promise<void>;
  addMenuItem: (item: NewMenuItem) => Promise<MenuItem | null>;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<MenuItem | null>;
  deleteMenuItem: (id: string) => Promise<boolean>;
  getMenuItemWithIngredients: (id: string) => Promise<MenuItemWithIngredients | null>;
  addMenuIngredient: (ingredient: NewMenuIngredient) => Promise<MenuIngredient | null>;
  updateMenuIngredient: (id: string, updates: Partial<MenuIngredient>) => Promise<MenuIngredient | null>;
  deleteMenuIngredient: (id: string) => Promise<boolean>;
  calculateMenuItemCost: (ingredients: MenuIngredient[]) => number;
  calculateProfitMargin: (price: number, costPrice: number) => number;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch menu items based on user's restaurant
  const fetchMenu = async () => {
    if (!user?.restaurant_id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch menu items from Django API
      const response = await menuAPI.getMenuItems(parseInt(user.restaurant_id));
      const data = response.data;

      setMenuItems(data || []);

      // Extract unique categories from menu items
      const categories = Array.from(new Set(data?.map((item: any) => item.category_name || item.category) || []));
      setMenuCategories(categories);

    } catch (err: any) {
      console.error('Error fetching menu:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add new menu item
  const addMenuItem = async (item: NewMenuItem): Promise<MenuItem | null> => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create menu item via Django API
      const response = await menuAPI.createMenuItem({
        ...item,
        restaurant: parseInt(user.restaurant_id)
      });
      const data = response.data;

      setMenuItems(prev => [...prev, data]);

      // Update categories if needed
      const categoryName = data.category_name || data.category;
      if (categoryName && !menuCategories.includes(categoryName)) {
        setMenuCategories(prev => [...prev, categoryName]);
      }

      toast.success('Menu item added successfully');
      return data;
    } catch (err: any) {
      console.error('Error adding menu item:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to add menu item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update existing menu item
  const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Remove unwanted fields from updates
      const { id: _, restaurant_id: __, created_at: ___, updated_at: ____, restaurant_name: _____, category_name: ______, ...cleanUpdates } = updates;

      const response = await menuAPI.updateMenuItem(parseInt(id), cleanUpdates);
      const data = response.data;

      setMenuItems(prev => prev.map(item => item.id === id ? data : item));

      // Update categories if needed
      const categoryName = data.category_name || data.category;
      if (categoryName && !menuCategories.includes(categoryName)) {
        setMenuCategories(prev => [...prev, categoryName]);
      }

      toast.success('Menu item updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating menu item:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to update menu item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete menu item
  const deleteMenuItem = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await menuAPI.deleteMenuItem(parseInt(id));
      
      setMenuItems(prev => prev.filter(item => item.id !== id));
      toast.success('Menu item deleted successfully');
      
      // Recalculate categories
      const remainingCategories = Array.from(new Set(menuItems.filter(item => item.id !== id).map(item => item.category)));
      setMenuCategories(remainingCategories);
      
      return true;
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      setError(err.message);
      toast.error('Failed to delete menu item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get menu item with its ingredients
  const getMenuItemWithIngredients = async (id: string): Promise<MenuItemWithIngredients | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get menu item
      const { data: menuItem, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (menuError) throw menuError;
      
      // Get ingredients
      const { data: ingredients, error: ingredientsError } = await supabase
        .from('menu_ingredients')
        .select(`
          *,
          inventory_item:inventory_items(name, cost_per_unit, current_stock, unit)
        `)
        .eq('menu_item_id', id);
      
      if (ingredientsError) throw ingredientsError;
      
      const menuItemWithIngredients: MenuItemWithIngredients = {
        ...menuItem,
        ingredients: ingredients || []
      };
      
      // Calculate cost price and profit margin
      menuItemWithIngredients.cost_price = calculateMenuItemCost(ingredients || []);
      menuItemWithIngredients.profit_margin = calculateProfitMargin(
        menuItemWithIngredients.price, 
        menuItemWithIngredients.cost_price
      );
      
      return menuItemWithIngredients;
    } catch (err: any) {
      console.error('Error getting menu item with ingredients:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add ingredient to menu item
  const addMenuIngredient = async (ingredient: NewMenuIngredient): Promise<MenuIngredient | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('menu_ingredients')
        .insert(ingredient)
        .select(`
          *,
          inventory_item:inventory_items(name, cost_per_unit, current_stock, unit)
        `)
        .single();
      
      if (error) throw error;
      
      toast.success('Ingredient added to menu item');
      return data;
    } catch (err: any) {
      console.error('Error adding menu ingredient:', err);
      setError(err.message);
      toast.error('Failed to add ingredient to menu item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update menu ingredient
  const updateMenuIngredient = async (id: string, updates: Partial<MenuIngredient>): Promise<MenuIngredient | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Remove unwanted fields from updates
      const { id: _, menu_item_id: __, inventory_item_id: ___, created_at: ____, updated_at: _____, inventory_item: ______, ...cleanUpdates } = updates;
      
      const { data, error } = await supabase
        .from('menu_ingredients')
        .update(cleanUpdates)
        .eq('id', id)
        .select(`
          *,
          inventory_item:inventory_items(name, cost_per_unit, current_stock, unit)
        `)
        .single();
      
      if (error) throw error;
      
      toast.success('Menu ingredient updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating menu ingredient:', err);
      setError(err.message);
      toast.error('Failed to update menu ingredient');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete menu ingredient
  const deleteMenuIngredient = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from('menu_ingredients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Ingredient removed from menu item');
      return true;
    } catch (err: any) {
      console.error('Error deleting menu ingredient:', err);
      setError(err.message);
      toast.error('Failed to remove ingredient from menu item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate menu item cost based on ingredients
  const calculateMenuItemCost = (ingredients: MenuIngredient[]): number => {
    return ingredients.reduce((total, ingredient) => {
      const costPerUnit = ingredient.inventory_item?.cost_per_unit || 0;
      return total + (ingredient.quantity * costPerUnit);
    }, 0);
  };
  
  // Calculate profit margin
  const calculateProfitMargin = (price: number, costPrice: number): number => {
    if (costPrice === 0) return 100;
    if (price === 0) return 0;
    return ((price - costPrice) / price) * 100;
  };
  
  // Load menu on mount and when user changes
  useEffect(() => {
    if (user?.restaurant_id) {
      fetchMenu();
    } else {
      setMenuItems([]);
      setMenuCategories([]);
    }
  }, [user?.restaurant_id]);
  
  return (
    <MenuContext.Provider
      value={{
        menuItems,
        menuCategories,
        isLoading,
        error,
        fetchMenu,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        getMenuItemWithIngredients,
        addMenuIngredient,
        updateMenuIngredient,
        deleteMenuIngredient,
        calculateMenuItemCost,
        calculateProfitMargin
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};