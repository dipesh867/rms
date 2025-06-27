import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit: number;
  supplier_id?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
  restaurant_id: string;
  barcode?: string;
  sku?: string;
  location?: string;
  expiry_date?: string;
  last_restocked?: string;
  created_at: string;
  updated_at: string;
}

interface NewInventoryItem {
  name: string;
  category: string;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  cost_per_unit: number;
  supplier_id?: string;
  barcode?: string;
  sku?: string;
  location?: string;
  expiry_date?: string;
}

interface InventoryTransaction {
  inventory_item_id: string;
  order_id?: string;
  order_item_id?: string;
  quantity: number;
  transaction_type: 'order-use' | 'restock' | 'waste' | 'adjustment' | 'transfer' | 'expired';
  notes?: string;
}

// Unit conversion mapping
interface UnitConversion {
  base: string;
  factor: number;
}

interface UnitConversions {
  [key: string]: UnitConversion;
}

interface InventoryContextType {
  inventoryItems: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: () => Promise<void>;
  addInventoryItem: (item: NewInventoryItem) => Promise<InventoryItem | null>;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<InventoryItem | null>;
  deleteInventoryItem: (id: string) => Promise<boolean>;
  recordTransaction: (transaction: InventoryTransaction) => Promise<boolean>;
  getInventoryItem: (id: string) => Promise<InventoryItem | null>;
  getLowStockItems: () => InventoryItem[];
  convertUnit: (value: number, fromUnit: string, toUnit: string) => number;
  getUnitConversions: () => UnitConversions;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Unit conversion mapping
const unitConversions: UnitConversions = {
  // Weight
  'kg': { base: 'g', factor: 1000 },
  'g': { base: 'g', factor: 1 },
  // Volume
  'L': { base: 'ml', factor: 1000 },
  'ml': { base: 'ml', factor: 1 },
  // Count
  'dozen': { base: 'pcs', factor: 12 },
  'pcs': { base: 'pcs', factor: 1 },
  'each': { base: 'pcs', factor: 1 },
  // Custom units without conversion
  'box': { base: 'box', factor: 1 },
  'bottle': { base: 'bottle', factor: 1 },
  'jar': { base: 'jar', factor: 1 },
  'can': { base: 'can', factor: 1 },
  'pack': { base: 'pack', factor: 1 }
};

export const InventoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch inventory items based on user's restaurant
  const fetchInventory = async () => {
    if (!user?.restaurant_id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('restaurant_id', user.restaurant_id)
        .order('name');
      
      if (error) throw error;
      
      setInventoryItems(data || []);
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message);
      toast.error('Failed to load inventory items');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Convert between units
  const convertUnit = (value: number, fromUnit: string, toUnit: string): number => {
    // If same unit, no conversion needed
    if (fromUnit === toUnit) return value;
    
    const fromConversion = unitConversions[fromUnit];
    const toConversion = unitConversions[toUnit];
    
    // If units don't have conversion factors or are not compatible
    if (!fromConversion || !toConversion || fromConversion.base !== toConversion.base) {
      console.warn(`Cannot convert from ${fromUnit} to ${toUnit}`);
      return value;
    }
    
    // Convert from -> base -> to
    const baseValue = value * fromConversion.factor;
    return baseValue / toConversion.factor;
  };
  
  // Get all unit conversions
  const getUnitConversions = () => unitConversions;
  
  // Add new inventory item
  const addInventoryItem = async (item: NewInventoryItem): Promise<InventoryItem | null> => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...item,
          restaurant_id: user.restaurant_id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setInventoryItems(prev => [...prev, data]);
      toast.success('Inventory item added successfully');
      return data;
    } catch (err: any) {
      console.error('Error adding inventory item:', err);
      setError(err.message);
      toast.error('Failed to add inventory item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update existing inventory item
  const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Remove unchanged fields and id/restaurant_id from updates
      const { id: _, restaurant_id: __, created_at: ___, updated_at: ____, ...cleanUpdates } = updates;
      
      const { data, error } = await supabase
        .from('inventory_items')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setInventoryItems(prev => prev.map(item => item.id === id ? data : item));
      toast.success('Inventory item updated successfully');
      return data;
    } catch (err: any) {
      console.error('Error updating inventory item:', err);
      setError(err.message);
      toast.error('Failed to update inventory item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete inventory item
  const deleteInventoryItem = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if this item is used in any menu
      const { data: menuIngredients, error: checkError } = await supabase
        .from('menu_ingredients')
        .select('menu_item_id')
        .eq('inventory_item_id', id);
        
      if (checkError) throw checkError;
      
      if (menuIngredients && menuIngredients.length > 0) {
        toast.error(`This ingredient is used in ${menuIngredients.length} menu items. Remove from menus first.`);
        return false;
      }
      
      // Delete the item
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setInventoryItems(prev => prev.filter(item => item.id !== id));
      toast.success('Inventory item deleted successfully');
      return true;
    } catch (err: any) {
      console.error('Error deleting inventory item:', err);
      setError(err.message);
      toast.error('Failed to delete inventory item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Record an inventory transaction
  const recordTransaction = async (transaction: InventoryTransaction): Promise<boolean> => {
    if (!user?.restaurant_id || !user?.id) {
      toast.error('Authentication error');
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Begin a transaction to ensure atomicity
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');
      
      // Insert transaction record
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          ...transaction,
          restaurant_id: user.restaurant_id,
          created_by: user.id
        });
      
      if (transactionError) throw transactionError;
      
      // Update inventory quantity
      const { error: updateError } = await supabase.rpc('update_inventory_quantity', {
        p_inventory_item_id: transaction.inventory_item_id,
        p_quantity: transaction.quantity
      });
      
      if (updateError) throw updateError;
      
      // If this is a waste transaction, also log it in the waste_log
      if (transaction.transaction_type === 'waste' && transaction.quantity < 0) {
        // Get the cost of the item
        const { data: itemData } = await supabase
          .from('inventory_items')
          .select('cost_per_unit')
          .eq('id', transaction.inventory_item_id)
          .single();
        
        if (itemData) {
          const { error: wasteError } = await supabase
            .from('waste_log')
            .insert({
              restaurant_id: user.restaurant_id,
              inventory_item_id: transaction.inventory_item_id,
              quantity: Math.abs(transaction.quantity),
              reason: transaction.notes || 'Waste',
              cost: Math.abs(transaction.quantity) * itemData.cost_per_unit,
              reported_by: user.id
            });
          
          if (wasteError) console.error('Error recording waste:', wasteError);
        }
      }
      
      // Refresh inventory data
      await fetchInventory();
      toast.success('Inventory transaction recorded successfully');
      return true;
    } catch (err: any) {
      console.error('Error recording inventory transaction:', err);
      setError(err.message);
      toast.error('Failed to record inventory transaction');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get a specific inventory item by ID
  const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error getting inventory item:', err);
      return null;
    }
  };
  
  // Get low stock items
  const getLowStockItems = (): InventoryItem[] => {
    return inventoryItems.filter(item => 
      item.status === 'low-stock' || item.status === 'out-of-stock'
    );
  };
  
  // Load inventory on mount and when user changes
  useEffect(() => {
    if (user?.restaurant_id) {
      fetchInventory();
    } else {
      setInventoryItems([]);
    }
  }, [user?.restaurant_id]);
  
  return (
    <InventoryContext.Provider
      value={{
        inventoryItems,
        isLoading,
        error,
        fetchInventory,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        recordTransaction,
        getInventoryItem,
        getLowStockItems,
        convertUnit,
        getUnitConversions
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};