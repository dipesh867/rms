import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Notification, Order, Table, MenuItem, InventoryItem, Staff, Customer, Room, Analytics, Chair } from '../types';
import toast from 'react-hot-toast';

interface AppContextType {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
  orders: Order[];
  tables: Table[];
  menuItems: MenuItem[];
  inventory: InventoryItem[];
  staff: Staff[];
  customers: Customer[];
  rooms: Room[];
  analytics: Analytics;
  toggleTheme: () => void;
  login: (user: User) => void;
  logout: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  updateChairStatus: (tableId: string, chairId: string, status: Chair['status']) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addTable: (table: Omit<Table, 'id'>) => Table;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

// Generate chairs for a table
const generateChairsForTable = (tableId: string, capacity: number): Chair[] => {
  const chairs: Chair[] = [];
  for (let i = 1; i <= capacity; i++) {
    chairs.push({
      id: `${tableId}-chair-${i}`,
      number: `${i}`,
      status: 'available',
    });
  }
  return chairs;
};

// Mock data for demonstration
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
    price: 24.99,
    category: 'Pizza',
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?w=300&h=200&fit=crop',
    available: true,
    preparationTime: 15,
    allergens: ['gluten', 'dairy'],
    isVegan: false,
    isGlutenFree: false,
    calories: 420
  },
  {
    id: '2',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan',
    price: 18.99,
    category: 'Salads',
    image: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?w=300&h=200&fit=crop',
    available: true,
    preparationTime: 8,
    allergens: ['dairy'],
    isVegan: false,
    isGlutenFree: true,
    calories: 280
  },
  {
    id: '3',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon grilled to perfection with lemon butter sauce',
    price: 32.99,
    category: 'Seafood',
    image: 'https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?w=300&h=200&fit=crop',
    available: true,
    preparationTime: 20,
    allergens: ['fish'],
    isVegan: false,
    isGlutenFree: true,
    calories: 380
  }
];

// Create mock tables with chairs
const createMockTables = (): Table[] => {
  const mockTables: Table[] = [
    { 
      id: '1', 
      number: 'A1', 
      capacity: 2, 
      status: 'available', 
      section: 'Main Dining',
      shape: 'circle', 
      chairs: [] 
    },
    { 
      id: '2', 
      number: 'A2', 
      capacity: 4, 
      status: 'occupied', 
      section: 'Main Dining', 
      currentOrder: 'order1',
      shape: 'rectangle',
      chairs: [] 
    },
    { 
      id: '3', 
      number: 'A3', 
      capacity: 6, 
      status: 'reserved', 
      section: 'Main Dining',
      shape: 'rectangle',
      chairs: [] 
    },
    { 
      id: '4', 
      number: 'B1', 
      capacity: 2, 
      status: 'cleaning', 
      section: 'Patio',
      shape: 'circle',
      chairs: [] 
    },
    { 
      id: '5', 
      number: 'B2', 
      capacity: 4, 
      status: 'available', 
      section: 'Patio',
      shape: 'square',
      chairs: [] 
    },
    { 
      id: '6', 
      number: 'VIP1', 
      capacity: 8, 
      status: 'available', 
      section: 'VIP',
      shape: 'rectangle',
      chairs: [] 
    }
  ];

  // Generate chairs for each table
  mockTables.forEach(table => {
    table.chairs = generateChairsForTable(table.id, table.capacity);
    
    // For occupied tables, mark some chairs as occupied
    if (table.status === 'occupied') {
      for (let i = 0; i < Math.min(2, table.capacity); i++) {
        table.chairs[i].status = 'occupied';
        table.chairs[i].currentOrder = `order-chair-${i+1}`;
      }
    }
  });

  return mockTables;
};

const mockTables: Table[] = createMockTables();

const mockOrders: Order[] = [
  {
    id: 'order1',
    tableId: '2',
    chairId: '2-chair-1',
    items: [
      {
        id: 'item1',
        menuItemId: '1',
        quantity: 2,
        status: 'preparing',
        addedAt: new Date(),
        unitPrice: 24.99,
        chairId: '2-chair-1'
      },
      {
        id: 'item2',
        menuItemId: '2',
        quantity: 1,
        status: 'pending',
        addedAt: new Date(),
        unitPrice: 18.99,
        chairId: '2-chair-1'
      }
    ],
    status: 'active',
    subtotal: 68.97,
    tax: 6.90,
    serviceCharge: 3.45,
    discount: 0,
    total: 79.32,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(),
    orderType: 'dine-in'
  },
  {
    id: 'order-chair-2',
    tableId: '2',
    chairId: '2-chair-2',
    items: [
      {
        id: 'item3',
        menuItemId: '3',
        quantity: 1,
        status: 'preparing',
        addedAt: new Date(),
        unitPrice: 32.99,
        chairId: '2-chair-2'
      }
    ],
    status: 'active',
    subtotal: 32.99,
    tax: 3.30,
    serviceCharge: 1.65,
    discount: 0,
    total: 37.94,
    createdAt: new Date(Date.now() - 20 * 60 * 1000),
    updatedAt: new Date(),
    orderType: 'dine-in'
  }
];

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Tomatoes',
    category: 'Vegetables',
    currentStock: 25,
    minStock: 10,
    maxStock: 50,
    unit: 'kg',
    costPerUnit: 3.50,
    supplier: 'Fresh Farms',
    lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'in-stock'
  },
  {
    id: '2',
    name: 'Mozzarella Cheese',
    category: 'Dairy',
    currentStock: 5,
    minStock: 8,
    maxStock: 20,
    unit: 'kg',
    costPerUnit: 12.99,
    supplier: 'Dairy Co',
    lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'low-stock'
  }
];

const mockStaff: Staff[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Waiter',
    email: 'john@restaurant.com',
    phone: '+1234567890',
    salary: 35000,
    status: 'active',
    shift: 'morning',
    hireDate: new Date('2023-01-15'),
    performanceRating: 4.5
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Chef',
    email: 'maria@restaurant.com',
    phone: '+1234567891',
    salary: 55000,
    status: 'active',
    shift: 'afternoon',
    hireDate: new Date('2022-08-20'),
    performanceRating: 4.8
  }
];

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@email.com',
    phone: '+1234567892',
    loyaltyPoints: 1250,
    totalOrders: 28,
    totalSpent: 1420.50,
    lastVisit: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    membershipTier: 'gold'
  }
];

const mockRooms: Room[] = [
  {
    id: '1',
    number: '101',
    type: 'standard',
    status: 'available',
    capacity: 2,
    amenities: ['WiFi', 'AC', 'TV'],
    pricePerNight: 120,
    floor: 1
  },
  {
    id: '2',
    number: '201',
    type: 'deluxe',
    status: 'occupied',
    capacity: 4,
    amenities: ['WiFi', 'AC', 'TV', 'Minibar', 'Balcony'],
    pricePerNight: 180,
    floor: 2,
    checkIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    checkOut: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
  }
];

const mockAnalytics: Analytics = {
  totalRevenue: 125420.50,
  totalOrders: 1845,
  averageOrderValue: 67.95,
  topSellingItems: mockMenuItems.slice(0, 3),
  revenueGrowth: 12.5,
  orderGrowth: 8.3,
  customerGrowth: 15.2,
  dailyRevenue: [
    { date: '2024-01-01', revenue: 2450 },
    { date: '2024-01-02', revenue: 3200 },
    { date: '2024-01-03', revenue: 2890 },
    { date: '2024-01-04', revenue: 3100 },
    { date: '2024-01-05', revenue: 2750 },
    { date: '2024-01-06', revenue: 4200 },
    { date: '2024-01-07', revenue: 3800 }
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 85420 },
    { month: 'Feb', revenue: 92150 },
    { month: 'Mar', revenue: 108200 }
  ]
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Start with no user logged in - app will show login page
  const [user, setUser] = useState<User | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Low Stock Alert',
      message: 'Mozzarella Cheese is running low (5 kg remaining)',
      type: 'warning',
      read: false,
      createdAt: new Date(Date.now() - 15 * 60 * 1000)
    },
    {
      id: '2',
      title: 'New Order',
      message: 'Order #1234 received for Table A2',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Staff Check-in',
      message: 'John Smith checked in for morning shift',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 45 * 60 * 1000)
    },
    {
      id: '4',
      title: 'Table Reservation',
      message: 'New table reservation for 6 people at 7:00 PM',
      type: 'info',
      read: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: '5',
      title: 'Menu Update',
      message: 'New seasonal menu items have been added',
      type: 'success',
      read: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ]);

  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [menuItems] = useState<MenuItem[]>(mockMenuItems);
  const [inventory] = useState<InventoryItem[]>(mockInventory);
  const [staff] = useState<Staff[]>(mockStaff);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [rooms] = useState<Room[]>(mockRooms);
  const [analytics] = useState<Analytics>(mockAnalytics);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('user');
      }
    }

    // Listen for storage events from other tabs/components
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch (e) {
          console.error('Error parsing user data from storage event:', e);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Add login notification
    addNotification({
      title: 'Welcome Back!',
      message: `Successfully logged in as ${userData.name}`,
      type: 'success'
    });
  };

  const logout = () => {
    if (user) {
      addNotification({
        title: 'Logged Out',
        message: `${user.name} has been logged out successfully`,
        type: 'info'
      });
    }
    setUser(null);
    localStorage.removeItem('user');
    
    // Force navigation to login page
    window.location.href = '/rms/login';
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast for the notification
    if (notification.type === 'success') {
      toast.success(notification.message);
    } else if (notification.type === 'error') {
      toast.error(notification.message);
    } else if (notification.type === 'warning') {
      toast.custom(t => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} bg-amber-600 text-white px-6 py-3 shadow-md rounded-lg`}>
          <div className="flex">
            <div className="flex-1">
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm">{notification.message}</p>
            </div>
          </div>
        </div>
      ));
    } else {
      toast(notification.message);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
      )
    );
  };

  const updateTableStatus = (tableId: string, status: Table['status']) => {
    setTables(prev => 
      prev.map(table => 
        table.id === tableId ? { ...table, status } : table
      )
    );
  };

  const updateChairStatus = (tableId: string, chairId: string, status: Chair['status']) => {
    setTables(prev => 
      prev.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            chairs: table.chairs.map(chair => 
              chair.id === chairId ? { ...chair, status } : chair
            ),
            // If all chairs are available, the table is available too
            // If any chair is occupied, the table is occupied
            status: status === 'occupied' ? 'occupied' : 
                   table.chairs.every(c => c.id === chairId ? status === 'available' : c.status === 'available') 
                   ? 'available' : table.status
          };
        }
        return table;
      })
    );
  };

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setOrders(prev => [newOrder, ...prev]);

    // Update chair and table status
    if (orderData.tableId && orderData.chairId) {
      updateChairStatus(orderData.tableId, orderData.chairId, 'occupied');
    } else if (orderData.tableId) {
      // Legacy orders without chair info
      updateTableStatus(orderData.tableId, 'occupied');
    }
  };

  // Add a new table with chairs
  const addTable = (tableData: Omit<Table, 'id'>): Table => {
    const tableId = Date.now().toString();
    const newTable: Table = {
      ...tableData,
      id: tableId,
      chairs: tableData.chairs || generateChairsForTable(tableId, tableData.capacity)
    };
    
    setTables(prev => [...prev, newTable]);
    return newTable;
  };

  // Update a table and its chairs
  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(prev => 
      prev.map(table => {
        if (table.id === id) {
          // If capacity changed, regenerate chairs while preserving existing ones
          const updatedTable = { ...table, ...updates };
          if (updates.capacity && updates.capacity !== table.capacity) {
            // Keep existing chairs that are within the new capacity
            const existingChairs = table.chairs.slice(0, Math.min(table.chairs.length, updates.capacity));
            
            // If new capacity is larger, add new chairs
            if (updates.capacity > table.chairs.length) {
              const additionalChairs = generateChairsForTable(
                table.id, 
                updates.capacity - table.chairs.length,
                table.chairs.length // Start numbering from existing length
              );
              updatedTable.chairs = [...existingChairs, ...additionalChairs];
            } else {
              updatedTable.chairs = existingChairs;
            }
          }
          return updatedTable;
        }
        return table;
      })
    );
  };

  // Delete a table
  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(table => table.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user,
      theme,
      notifications,
      orders,
      tables,
      menuItems,
      inventory,
      staff,
      customers,
      rooms,
      analytics,
      toggleTheme,
      login,
      logout,
      addNotification,
      markNotificationRead,
      updateOrderStatus,
      updateTableStatus,
      updateChairStatus,
      addOrder,
      addTable,
      updateTable,
      deleteTable
    }}>
      {children}
    </AppContext.Provider>
  );
};