/**
 * Updated Inventory Hook using Django API
 * Replaces useInventory.tsx with Django backend integration
 */
import { useState, useEffect, createContext, useContext } from 'react';
import { inventoryAPI } from '../services/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: number;
  name: string;
  category: number;
  category_name?: string;
  restaurant: number;
  restaurant_name?: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit: number;
  supplier?: string;
  last_restocked?: string;
  expiry_date?: string;
  location?: string;
  barcode?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  stock_value?: number;
  created_at: string;
  updated_at: string;
}

interface InventoryCategory {
  id: number;
  name: string;
  description?: string;
  restaurant: number;
  items_count?: number;
  created_at: string;
}

interface NewInventoryItem {
  name: string;
  category: number;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit: number;
  supplier?: string;
  expiry_date?: string;
  location?: string;
  barcode?: string;
}

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  inventoryCategories: InventoryCategory[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  addInventoryItem: (item: NewInventoryItem) => Promise<InventoryItem | null>;
  updateInventoryItem: (id: number, updates: Partial<InventoryItem>) => Promise<InventoryItem | null>;
  deleteInventoryItem: (id: number) => Promise<boolean>;
  updateStock: (id: number, action: 'add' | 'subtract', quantity: number) => Promise<boolean>;
  getInventoryAlerts: () => Promise<any>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventoryAPI = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventoryAPI must be used within an InventoryAPIProvider');
  }
  return context;
};

interface InventoryAPIProviderProps {
  children: React.ReactNode;
}

export const InventoryAPIProvider: React.FC<InventoryAPIProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryCategories, setInventoryCategories] = useState<InventoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory items
  const fetchInventory = async () => {
    if (!user?.restaurant_id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await inventoryAPI.getItems(parseInt(user.restaurant_id));
      setInventoryItems(response.data || []);

    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to load inventory items');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inventory categories
  const fetchCategories = async () => {
    if (!user?.restaurant_id) return;

    try {
      const response = await inventoryAPI.getCategories(parseInt(user.restaurant_id));
      setInventoryCategories(response.data || []);
    } catch (err: any) {
      console.error('Error fetching inventory categories:', err);
    }
  };

  // Add new inventory item
  const addInventoryItem = async (item: NewInventoryItem): Promise<InventoryItem | null> => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await inventoryAPI.createItem({
        ...item,
        restaurant: parseInt(user.restaurant_id)
      });
      const data = response.data;

      setInventoryItems(prev => [...prev, data]);
      toast.success('Inventory item added successfully');
      return data;
    } catch (err: any) {
      console.error('Error adding inventory item:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to add inventory item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update inventory item
  const updateInventoryItem = async (id: number, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Remove unwanted fields
      const { id: _, restaurant: __, restaurant_name: ___, category_name: ____, stock_value: _____, created_at: ______, updated_at: _______, ...cleanUpdates } = updates;

      const response = await inventoryAPI.updateItem(id, cleanUpdates);
      const data = response.data;

      setInventoryItems(prev => prev.map(item => item.id === id ? data : item));
      toast.success('Inventory item updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating inventory item:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to update inventory item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete inventory item
  const deleteInventoryItem = async (id: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await inventoryAPI.deleteItem(id);

      setInventoryItems(prev => prev.filter(item => item.id !== id));
      toast.success('Inventory item deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting inventory item:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to delete inventory item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update stock levels
  const updateStock = async (id: number, action: 'add' | 'subtract', quantity: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await inventoryAPI.updateStock(id, action, quantity);
      const data = response.data;

      // Update local state
      setInventoryItems(prev => prev.map(item => 
        item.id === id 
          ? { ...item, current_stock: data.new_stock, status: data.status }
          : item
      ));

      toast.success('Stock updated successfully');
      return true;
    } catch (err: any) {
      console.error('Error updating stock:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to update stock');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get inventory alerts
  const getInventoryAlerts = async () => {
    if (!user?.restaurant_id) return null;

    try {
      const response = await inventoryAPI.getAlerts(parseInt(user.restaurant_id));
      return response.data;
    } catch (err: any) {
      console.error('Error fetching inventory alerts:', err);
      return null;
    }
  };

  // Auto-fetch on mount and user change
  useEffect(() => {
    if (user?.restaurant_id) {
      fetchInventory();
      fetchCategories();
    }
  }, [user?.restaurant_id]);

  const value: InventoryContextType = {
    inventoryItems,
    inventoryCategories,
    isLoading,
    error,
    fetchInventory,
    fetchCategories,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock,
    getInventoryAlerts
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export default useInventoryAPI;
