export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'manager' | 'staff' | 'kitchen' | 'vendor' | 'customer';
  avatar?: string;
  permissions?: string[];
  status: 'active' | 'inactive';
  lastLogin?: Date;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  preparationTime: number;
  allergens?: string[];
  ingredients?: string[];
  calories?: number;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  vendorId?: string;
}

export interface Chair {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: string;
  customerName?: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  currentOrder?: string;
  section: string;
  qrCode?: string;
  waiterAssigned?: string;
  reservationTime?: Date;
  chairs: Chair[];
  shape?: 'rectangle' | 'circle' | 'square';
  positionX?: number;
  positionY?: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  addedAt: Date;
  unitPrice: number;
  customizations?: string[];
  chairId?: string;  // Added to support chair-specific orders
}

export interface Order {
  id: string;
  tableId?: string;
  chairId?: string;  // Added to support chair-specific orders
  table?: Table;
  items: OrderItem[];
  status: 'active' | 'completed' | 'cancelled' | 'payment-pending';
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  customerId?: string;
  customer?: Customer;
  notes?: string;
  paymentMethod?: 'cash' | 'card' | 'upi' | 'wallet' | 'credit';
  waiterAssigned?: string;
  orderType: 'dine-in' | 'takeaway' | 'delivery' | 'room-service';
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  costPerUnit: number;
  supplier?: string;
  lastRestocked: Date;
  expiryDate?: Date;
  location?: string;
  barcode?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired';
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  salary: number;
  status: 'active' | 'inactive' | 'on-leave';
  shift: 'morning' | 'afternoon' | 'night' | 'split';
  hireDate: Date;
  avatar?: string;
  address?: string;
  emergencyContact?: string;
  performanceRating?: number;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  lastVisit: Date;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  preferredPaymentMethod?: string;
  dietaryRestrictions?: string[];
  birthday?: Date;
  address?: string;
}

export interface Room {
  id: string;
  number: string;
  type: 'standard' | 'deluxe' | 'suite' | 'presidential';
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved';
  capacity: number;
  amenities: string[];
  pricePerNight: number;
  currentGuest?: Customer;
  checkIn?: Date;
  checkOut?: Date;
  floor: number;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'restaurant' | 'hotel' | 'cafe' | 'bar';
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'pending-approval';
  rating: number;
  totalOrders: number;
  revenue: number;
  joinDate: Date;
  commission: number;
  deliveryRadius?: number;
  minimumOrder?: number;
}

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: MenuItem[];
  revenueGrowth: number;
  orderGrowth: number;
  customerGrowth: number;
  dailyRevenue: { date: string; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  userId?: string;
  actionUrl?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'utilities' | 'supplies' | 'staff' | 'marketing' | 'maintenance' | 'other';
  date: Date;
  paymentMethod: string;
  receipt?: string;
  recurring: boolean;
  approved: boolean;
  addedBy: string;
}

export interface WasteEntry {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  reason: 'expired' | 'damaged' | 'overcooked' | 'customer-return' | 'other';
  estimatedCost: number;
  date: Date;
  reportedBy: string;
  notes?: string;
}