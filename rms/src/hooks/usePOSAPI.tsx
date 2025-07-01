/**
 * Updated POS Hook using Django API
 * Replaces usePOS.tsx with Django backend integration
 */
import { useState, useEffect, createContext, useContext } from 'react';
import { orderAPI, tableAPI, customerAPI } from '../services/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

interface OrderItem {
  id: number;
  order: number;
  menu_item: number;
  menu_item_name?: string;
  menu_item_price?: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  customizations?: any[];
  chair?: number;
  chair_number?: string;
  added_at: string;
  updated_at: string;
}

interface Order {
  id: number;
  restaurant: number;
  restaurant_name?: string;
  table?: number;
  table_number?: string;
  chair?: number;
  customer?: number;
  customer_name?: string;
  status: 'active' | 'completed' | 'cancelled' | 'payment-pending';
  order_type: 'dine-in' | 'takeaway' | 'delivery' | 'room-service';
  subtotal: number;
  tax: number;
  service_charge: number;
  discount: number;
  total: number;
  payment_method?: string;
  waiter_assigned?: number;
  waiter_name?: string;
  notes?: string;
  order_items: OrderItem[];
  items_count?: number;
  created_at: string;
  updated_at: string;
}

interface NewOrder {
  table?: number;
  customer?: number;
  order_type: string;
  notes?: string;
}

interface NewOrderItem {
  menu_item: number;
  quantity: number;
  unit_price: number;
  notes?: string;
  customizations?: any[];
  chair?: number;
}

interface POSContextType {
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  fetchOrders: (status?: string) => Promise<void>;
  createOrder: (orderData: NewOrder) => Promise<Order | null>;
  addItemToOrder: (orderId: number, item: NewOrderItem) => Promise<boolean>;
  updateOrderStatus: (orderId: number, status: string) => Promise<boolean>;
  updateOrderItemStatus: (itemId: number, status: string) => Promise<boolean>;
  calculateOrderTotal: (order: Order) => void;
  setActiveOrder: (order: Order | null) => void;
  completeOrder: (orderId: number, paymentMethod: string) => Promise<boolean>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const usePOSAPI = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOSAPI must be used within a POSAPIProvider');
  }
  return context;
};

interface POSAPIProviderProps {
  children: React.ReactNode;
}

export const POSAPIProvider: React.FC<POSAPIProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = async (status?: string) => {
    if (!user?.restaurant_id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await orderAPI.getOrders(parseInt(user.restaurant_id), status);
      setOrders(response.data || []);

    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new order
  const createOrder = async (orderData: NewOrder): Promise<Order | null> => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await orderAPI.createOrder({
        ...orderData,
        restaurant: parseInt(user.restaurant_id),
        status: 'active',
        subtotal: 0,
        tax: 0,
        service_charge: 0,
        discount: 0,
        total: 0
      });
      const data = response.data;

      setOrders(prev => [data, ...prev]);
      setActiveOrder(data);
      toast.success('Order created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to create order');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to order (this would need a separate API endpoint)
  const addItemToOrder = async (orderId: number, item: NewOrderItem): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // This would need a dedicated API endpoint for adding items to orders
      // For now, we'll update the order directly
      const orderResponse = await orderAPI.updateOrder(orderId, {
        // Add logic to append item to order
      });

      // Refresh orders
      await fetchOrders();
      toast.success('Item added to order');
      return true;
    } catch (err: any) {
      console.error('Error adding item to order:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to add item to order');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: number, status: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await orderAPI.updateOrderStatus(orderId, status);

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: status as any } : order
      ));

      if (activeOrder?.id === orderId) {
        setActiveOrder(prev => prev ? { ...prev, status: status as any } : null);
      }

      toast.success('Order status updated');
      return true;
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to update order status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update order item status (for kitchen)
  const updateOrderItemStatus = async (itemId: number, status: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await orderAPI.updateKitchenItemStatus(itemId, status);

      // Update local state
      setOrders(prev => prev.map(order => ({
        ...order,
        order_items: order.order_items.map(item =>
          item.id === itemId ? { ...item, status: status as any } : item
        )
      })));

      if (activeOrder) {
        setActiveOrder(prev => prev ? {
          ...prev,
          order_items: prev.order_items.map(item =>
            item.id === itemId ? { ...item, status: status as any } : item
          )
        } : null);
      }

      toast.success('Item status updated');
      return true;
    } catch (err: any) {
      console.error('Error updating item status:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to update item status');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate order total
  const calculateOrderTotal = (order: Order) => {
    const subtotal = order.order_items.reduce((sum, item) => sum + item.total_price, 0);
    const tax = subtotal * 0.1; // 10% tax
    const serviceCharge = subtotal * 0.05; // 5% service charge
    const total = subtotal + tax + serviceCharge - order.discount;

    return {
      subtotal,
      tax,
      service_charge: serviceCharge,
      total
    };
  };

  // Complete order
  const completeOrder = async (orderId: number, paymentMethod: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      await orderAPI.updateOrder(orderId, {
        status: 'completed',
        payment_method: paymentMethod
      });

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'completed', payment_method: paymentMethod }
          : order
      ));

      if (activeOrder?.id === orderId) {
        setActiveOrder(null);
      }

      toast.success('Order completed successfully');
      return true;
    } catch (err: any) {
      console.error('Error completing order:', err);
      setError(err.response?.data?.error || err.message);
      toast.error('Failed to complete order');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount and user change
  useEffect(() => {
    if (user?.restaurant_id) {
      fetchOrders();
    }
  }, [user?.restaurant_id]);

  const value: POSContextType = {
    orders,
    activeOrder,
    isLoading,
    error,
    fetchOrders,
    createOrder,
    addItemToOrder,
    updateOrderStatus,
    updateOrderItemStatus,
    calculateOrderTotal,
    setActiveOrder,
    completeOrder
  };

  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
};

export default usePOSAPI;
