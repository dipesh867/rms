import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './useAuth';
import { useInventory } from './useInventory';
import { useMenu } from './useMenu';
import toast from 'react-hot-toast';

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  notes?: string;
}

interface Order {
  id: string;
  order_number: string;
  table_id?: string;
  customer_id?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  order_type: 'dine-in' | 'takeaway' | 'delivery' | 'room-service';
  subtotal: number;
  tax: number;
  service_charge: number;
  discount: number;
  total: number;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'refunded' | 'partially_refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItemWithDetails[];
}

interface OrderItemWithDetails {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  created_at: string;
  updated_at: string;
  menu_item?: {
    name: string;
    category: string;
    preparation_time: number;
  };
}

interface NewOrder {
  table_id?: string;
  customer_id?: string;
  items: OrderItem[];
  order_type: 'dine-in' | 'takeaway' | 'delivery' | 'room-service';
  discount?: number;
  notes?: string;
  payment_method?: string;
}

interface POSConfig {
  tax_rate: number;
  service_charge_rate: number;
  invoice_prefix: string;
  next_invoice_number: number;
  enable_auto_inventory: boolean;
  default_payment_method?: string;
  rounded_to_nearest?: 'none' | '0.5' | '1';
}

interface POSContextType {
  activeOrders: Order[];
  completedOrders: Order[];
  isLoading: boolean;
  error: string | null;
  posConfig: POSConfig;
  fetchOrders: (status?: string) => Promise<void>;
  createOrder: (order: NewOrder) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<boolean>;
  updateOrderItem: (id: string, updates: Partial<OrderItemWithDetails>) => Promise<boolean>;
  processPayment: (orderId: string, method: string) => Promise<boolean>;
  getOrderDetails: (id: string) => Promise<Order | null>;
  voidOrder: (id: string, reason: string) => Promise<boolean>;
  applyDiscount: (orderId: string, amount: number, isPercentage: boolean) => Promise<boolean>;
  getOrderCount: () => Promise<{ pending: number; active: number; completed: number }>;
  getDailyRevenue: () => Promise<number>;
  updatePOSConfig: (config: Partial<POSConfig>) => Promise<boolean>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { recordTransaction } = useInventory();
  const { menuItems } = useMenu();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posConfig, setPOSConfig] = useState<POSConfig>({
    tax_rate: 10, // Default 10%
    service_charge_rate: 5, // Default 5%
    invoice_prefix: 'INV',
    next_invoice_number: 1001,
    enable_auto_inventory: true,
    default_payment_method: 'cash',
    rounded_to_nearest: 'none',
  });
  
  // Fetch orders based on status
  const fetchOrders = async (status?: string) => {
    if (!user?.restaurant_id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(name, category, preparation_time)
          )
        `)
        .eq('restaurant_id', user.restaurant_id);
      
      if (status) {
        if (status === 'active') {
          // Active orders are those that are not completed or cancelled
          query = query.not('status', 'in', '("completed","cancelled")');
        } else {
          query = query.eq('status', status);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).execute();
      
      if (error) throw error;
      
      if (status === 'completed' || status === 'cancelled') {
        setCompletedOrders(data || []);
      } else {
        setActiveOrders(data || []);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new order
  const createOrder = async (orderData: NewOrder): Promise<Order | null> => {
    if (!user?.restaurant_id || !user?.id) {
      toast.error('Authentication error');
      return null;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate order totals
      const menuItemsMap = new Map(menuItems.map(item => [item.id, item]));
      
      let subtotal = 0;
      for (const item of orderData.items) {
        const menuItem = menuItemsMap.get(item.menu_item_id);
        if (!menuItem) {
          throw new Error(`Menu item not found: ${item.menu_item_id}`);
        }
        subtotal += menuItem.price * item.quantity;
      }
      
      // Apply discount if provided
      const discount = orderData.discount || 0;
      
      // Calculate tax and service charge
      const taxableAmount = subtotal - discount;
      const tax = (taxableAmount * posConfig.tax_rate) / 100;
      const serviceCharge = (taxableAmount * posConfig.service_charge_rate) / 100;
      
      // Calculate total
      let total = taxableAmount + tax + serviceCharge;
      
      // Apply rounding if configured
      if (posConfig.rounded_to_nearest === '0.5') {
        total = Math.round(total * 2) / 2;
      } else if (posConfig.rounded_to_nearest === '1') {
        total = Math.round(total);
      }
      
      // Generate order number
      const orderNumber = `${posConfig.invoice_prefix}${posConfig.next_invoice_number.toString().padStart(4, '0')}`;
      
      // Create order in database
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          restaurant_id: user.restaurant_id,
          table_id: orderData.table_id,
          server_id: user.id,
          customer_id: orderData.customer_id,
          status: 'pending',
          order_type: orderData.order_type,
          subtotal,
          tax,
          service_charge: serviceCharge,
          discount,
          total,
          payment_method: orderData.payment_method || posConfig.default_payment_method,
          payment_status: 'pending',
          notes: orderData.notes
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Update next invoice number
      await updatePOSConfig({ next_invoice_number: posConfig.next_invoice_number + 1 });
      
      // Create order items
      const orderItems = orderData.items.map(item => {
        const menuItem = menuItemsMap.get(item.menu_item_id);
        return {
          order_id: orderResult.id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          price_at_time: menuItem ? menuItem.price : 0,
          notes: item.notes,
          status: 'pending'
        };
      });
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // If auto-inventory deduction is enabled, record inventory transactions
      if (posConfig.enable_auto_inventory) {
        try {
          // For each order item, get its ingredients and deduct from inventory
          for (const item of orderData.items) {
            const { data: ingredients } = await supabase
              .from('menu_ingredients')
              .select(`
                inventory_item_id,
                quantity,
                unit,
                is_optional
              `)
              .eq('menu_item_id', item.menu_item_id);
            
            if (ingredients && ingredients.length > 0) {
              for (const ingredient of ingredients) {
                // Skip optional ingredients for now (future enhancement could ask if they were used)
                if (ingredient.is_optional) continue;
                
                // Deduct from inventory (negative quantity for deduction)
                const deductQuantity = -(ingredient.quantity * item.quantity);
                
                await recordTransaction({
                  inventory_item_id: ingredient.inventory_item_id,
                  order_id: orderResult.id,
                  quantity: deductQuantity,
                  transaction_type: 'order-use',
                  notes: `Used in order ${orderNumber}`
                });
              }
            }
          }
        } catch (ingredientError) {
          console.error('Error deducting ingredients from inventory:', ingredientError);
          toast.warning('Order created but inventory may not be updated correctly');
        }
      }
      
      // Update active orders
      const newOrder: Order = { ...orderResult, items: [] };
      setActiveOrders(prev => [newOrder, ...prev]);
      
      toast.success('Order created successfully');
      return newOrder;
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.message);
      toast.error('Failed to create order');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update order status
  const updateOrderStatus = async (id: string, status: Order['status']): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state based on new status
      if (status === 'completed' || status === 'cancelled') {
        setActiveOrders(prev => prev.filter(order => order.id !== id));
        setCompletedOrders(prev => [data, ...prev]);
      } else {
        setActiveOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
      }
      
      toast.success(`Order ${status}`);
      return true;
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.message);
      toast.error('Failed to update order status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update order item status
  const updateOrderItem = async (id: string, updates: Partial<OrderItemWithDetails>): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Remove unwanted fields
      const { id: _, order_id: __, menu_item_id: ___, menu_item: ____, created_at: _____, updated_at: ______, ...cleanUpdates } = updates;
      
      const { error } = await supabase
        .from('order_items')
        .update(cleanUpdates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Order item updated');
      
      // Refresh orders to get updated data
      await fetchOrders();
      
      return true;
    } catch (err: any) {
      console.error('Error updating order item:', err);
      setError(err.message);
      toast.error('Failed to update order item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Process payment for an order
  const processPayment = async (orderId: string, method: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('orders')
        .update({
          payment_method: method,
          payment_status: 'paid',
          status: 'completed'
        })
        .eq('id', orderId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setActiveOrders(prev => prev.filter(order => order.id !== orderId));
      setCompletedOrders(prev => [data, ...prev]);
      
      toast.success('Payment processed successfully');
      return true;
    } catch (err: any) {
      console.error('Error processing payment:', err);
      setError(err.message);
      toast.error('Failed to process payment');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get detailed order information
  const getOrderDetails = async (id: string): Promise<Order | null> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            menu_item:menu_items(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (err: any) {
      console.error('Error getting order details:', err);
      toast.error('Failed to load order details');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Void an order (cancel and handle inventory)
  const voidOrder = async (id: string, reason: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Get order details with items
      const order = await getOrderDetails(id);
      if (!order) throw new Error('Order not found');
      
      // 2. Update order status to cancelled
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          notes: order.notes ? `${order.notes}\nVoided: ${reason}` : `Voided: ${reason}`
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // 3. If inventory was deducted and auto-inventory is enabled, restore it
      if (posConfig.enable_auto_inventory && order.items && order.items.length > 0) {
        try {
          // For each order item that might have deducted inventory
          for (const item of order.items) {
            // Get the ingredients used for this menu item
            const { data: ingredients } = await supabase
              .from('menu_ingredients')
              .select('inventory_item_id, quantity, unit, is_optional')
              .eq('menu_item_id', item.menu_item_id);
            
            if (ingredients && ingredients.length > 0) {
              for (const ingredient of ingredients) {
                // Skip optional ingredients
                if (ingredient.is_optional) continue;
                
                // Add back to inventory (positive quantity for addition)
                const returnQuantity = ingredient.quantity * item.quantity;
                
                await recordTransaction({
                  inventory_item_id: ingredient.inventory_item_id,
                  order_id: order.id,
                  quantity: returnQuantity,
                  transaction_type: 'adjustment',
                  notes: `Order ${order.order_number} voided: ${reason}`
                });
              }
            }
          }
        } catch (ingredientError) {
          console.error('Error restoring ingredients to inventory:', ingredientError);
          toast.warning('Order voided but inventory may not be restored correctly');
        }
      }
      
      // Update local state
      setActiveOrders(prev => prev.filter(order => order.id !== id));
      
      toast.success('Order voided successfully');
      return true;
    } catch (err: any) {
      console.error('Error voiding order:', err);
      setError(err.message);
      toast.error('Failed to void order');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Apply discount to order
  const applyDiscount = async (orderId: string, amount: number, isPercentage: boolean): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Get current order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('subtotal, tax, service_charge')
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      // 2. Calculate discount amount
      let discountAmount: number;
      if (isPercentage) {
        discountAmount = (order.subtotal * amount) / 100;
      } else {
        discountAmount = amount;
      }
      
      // Ensure discount doesn't exceed subtotal
      discountAmount = Math.min(discountAmount, order.subtotal);
      
      // 3. Recalculate total
      const taxableAmount = order.subtotal - discountAmount;
      const total = taxableAmount + order.tax + order.service_charge;
      
      // 4. Update order
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          discount: discountAmount,
          total
        })
        .eq('id', orderId);
      
      if (updateError) throw updateError;
      
      // 5. Refresh orders
      await fetchOrders('active');
      
      toast.success('Discount applied successfully');
      return true;
    } catch (err: any) {
      console.error('Error applying discount:', err);
      setError(err.message);
      toast.error('Failed to apply discount');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get count of orders by status
  const getOrderCount = async (): Promise<{ pending: number; active: number; completed: number }> => {
    if (!user?.restaurant_id) {
      return { pending: 0, active: 0, completed: 0 };
    }
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();
      
      // Count pending orders
      const { count: pendingCount, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', user.restaurant_id)
        .eq('status', 'pending')
        .gte('created_at', todayStr);
      
      if (pendingError) throw pendingError;
      
      // Count all active (non-completed, non-cancelled) orders
      const { count: activeCount, error: activeError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', user.restaurant_id)
        .not('status', 'in', '("completed","cancelled")')
        .gte('created_at', todayStr);
      
      if (activeError) throw activeError;
      
      // Count completed orders
      const { count: completedCount, error: completedError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', user.restaurant_id)
        .eq('status', 'completed')
        .gte('created_at', todayStr);
      
      if (completedError) throw completedError;
      
      return {
        pending: pendingCount || 0,
        active: activeCount || 0,
        completed: completedCount || 0
      };
    } catch (err) {
      console.error('Error counting orders:', err);
      return { pending: 0, active: 0, completed: 0 };
    }
  };
  
  // Get daily revenue
  const getDailyRevenue = async (): Promise<number> => {
    if (!user?.restaurant_id) {
      return 0;
    }
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();
      
      const { data, error } = await supabase
        .from('orders')
        .select('total')
        .eq('restaurant_id', user.restaurant_id)
        .eq('status', 'completed')
        .gte('created_at', todayStr);
      
      if (error) throw error;
      
      const totalRevenue = data?.reduce((sum, order) => sum + order.total, 0) || 0;
      return totalRevenue;
    } catch (err) {
      console.error('Error calculating daily revenue:', err);
      return 0;
    }
  };
  
  // Update POS configuration
  const updatePOSConfig = async (config: Partial<POSConfig>): Promise<boolean> => {
    try {
      // Update local state
      setPOSConfig(prev => ({ ...prev, ...config }));
      
      // TODO: In a real implementation, this would save to a database table
      // For now, we're just updating the local state
      
      return true;
    } catch (err) {
      console.error('Error updating POS config:', err);
      return false;
    }
  };
  
  // Load orders on mount and when user changes
  useEffect(() => {
    if (user?.restaurant_id) {
      fetchOrders('active');
      fetchOrders('completed');
      
      // In a real app, you would load POS config from database
      // For now, we're using default values
    } else {
      setActiveOrders([]);
      setCompletedOrders([]);
    }
  }, [user?.restaurant_id]);
  
  return (
    <POSContext.Provider
      value={{
        activeOrders,
        completedOrders,
        isLoading,
        error,
        posConfig,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        updateOrderItem,
        processPayment,
        getOrderDetails,
        voidOrder,
        applyDiscount,
        getOrderCount,
        getDailyRevenue,
        updatePOSConfig
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};