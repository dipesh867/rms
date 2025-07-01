/**
 * Centralized API service for Restaurant Management System
 * Replaces Supabase calls with Django REST API calls
 */
import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// === DASHBOARD APIs ===
export const dashboardAPI = {
  // Admin dashboard
  getAdminStats: () => apiClient.get('/dashboard/admin/dashboard/'),
  
  // Owner dashboard
  getOwnerStats: (restaurantId: number) => 
    apiClient.get(`/dashboard/owner/restaurant/${restaurantId}/dashboard/`),
  
  // Manager dashboard
  getManagerStats: (restaurantId: number) => 
    apiClient.get(`/dashboard/manager/restaurant/${restaurantId}/dashboard/`),
  
  // Kitchen dashboard
  getKitchenStats: (restaurantId: number) => 
    apiClient.get(`/dashboard/kitchen/restaurant/${restaurantId}/dashboard/`),
  
  // Staff dashboard
  getStaffStats: (restaurantId: number) => 
    apiClient.get(`/dashboard/staff/restaurant/${restaurantId}/dashboard/`),
  
  // Real-time status
  getRealTimeStatus: (restaurantId: number) => 
    apiClient.get(`/dashboard/realtime/restaurant/${restaurantId}/`),
};

// === MENU MANAGEMENT APIs ===
export const menuAPI = {
  // Categories
  getCategories: (restaurantId?: number) => {
    const params = restaurantId ? { restaurant: restaurantId } : {};
    return apiClient.get('/api/menu/categories/', { params });
  },
  
  createCategory: (data: any) => apiClient.post('/api/menu/categories/', data),
  
  updateCategory: (id: number, data: any) => 
    apiClient.put(`/api/menu/categories/${id}/`, data),
  
  deleteCategory: (id: number) => apiClient.delete(`/api/menu/categories/${id}/`),
  
  // Menu Items
  getMenuItems: (restaurantId?: number, categoryId?: number) => {
    const params: any = {};
    if (restaurantId) params.restaurant = restaurantId;
    if (categoryId) params.category = categoryId;
    return apiClient.get('/api/menu/items/', { params });
  },
  
  createMenuItem: (data: any) => apiClient.post('/api/menu/items/', data),
  
  updateMenuItem: (id: number, data: any) => 
    apiClient.put(`/api/menu/items/${id}/`, data),
  
  deleteMenuItem: (id: number) => apiClient.delete(`/api/menu/items/${id}/`),
};

// === INVENTORY MANAGEMENT APIs ===
export const inventoryAPI = {
  // Categories
  getCategories: (restaurantId?: number) => {
    const params = restaurantId ? { restaurant: restaurantId } : {};
    return apiClient.get('/api/inventory/categories/', { params });
  },
  
  // Items
  getItems: (restaurantId?: number, categoryId?: number) => {
    const params: any = {};
    if (restaurantId) params.restaurant = restaurantId;
    if (categoryId) params.category = categoryId;
    return apiClient.get('/api/inventory/items/', { params });
  },
  
  createItem: (data: any) => apiClient.post('/api/inventory/items/', data),
  
  updateItem: (id: number, data: any) => 
    apiClient.put(`/api/inventory/items/${id}/`, data),
  
  deleteItem: (id: number) => apiClient.delete(`/api/inventory/items/${id}/`),
  
  updateStock: (id: number, action: 'add' | 'subtract', quantity: number) =>
    apiClient.post(`/api/inventory/items/${id}/update-stock/`, { action, quantity }),
  
  getAlerts: (restaurantId: number) =>
    apiClient.get(`/api/analytics/inventory-alerts/${restaurantId}/`),
};

// === TABLE MANAGEMENT APIs ===
export const tableAPI = {
  getTables: (restaurantId?: number) => {
    const params = restaurantId ? { restaurant: restaurantId } : {};
    return apiClient.get('/api/tables/', { params });
  },
  
  createTable: (data: any) => apiClient.post('/api/tables/', data),
  
  updateTable: (id: number, data: any) => apiClient.put(`/api/tables/${id}/`, data),
  
  deleteTable: (id: number) => apiClient.delete(`/api/tables/${id}/`),
  
  updateTableStatus: (id: number, status: string) =>
    apiClient.post(`/api/tables/${id}/update-status/`, { status }),
};

// === ORDER MANAGEMENT APIs ===
export const orderAPI = {
  getOrders: (restaurantId?: number, status?: string) => {
    const params: any = {};
    if (restaurantId) params.restaurant = restaurantId;
    if (status) params.status = status;
    return apiClient.get('/api/orders/', { params });
  },
  
  createOrder: (data: any) => apiClient.post('/api/orders/', data),
  
  updateOrder: (id: number, data: any) => apiClient.put(`/api/orders/${id}/`, data),
  
  updateOrderStatus: (id: number, status: string) =>
    apiClient.post(`/api/orders/${id}/update-status/`, { status }),
  
  // Kitchen operations
  updateKitchenItemStatus: (itemId: number, status: string) =>
    apiClient.post(`/dashboard/kitchen/item/${itemId}/update-status/`, { status }),
};

// === CUSTOMER MANAGEMENT APIs ===
export const customerAPI = {
  getCustomers: (restaurantId?: number) => {
    const params = restaurantId ? { restaurant: restaurantId } : {};
    return apiClient.get('/api/customers/', { params });
  },
  
  createCustomer: (data: any) => apiClient.post('/api/customers/', data),
  
  updateCustomer: (id: number, data: any) => 
    apiClient.put(`/api/customers/${id}/`, data),
  
  deleteCustomer: (id: number) => apiClient.delete(`/api/customers/${id}/`),
};

// === STAFF MANAGEMENT APIs ===
export const staffAPI = {
  getStaff: (restaurantId?: number) => {
    const params: any = {};
    if (restaurantId) params.employee__restaurants = restaurantId;
    return apiClient.get('/api/staff/', { params });
  },
  
  createStaff: (data: any) => apiClient.post('/api/staff/', data),
  
  updateStaff: (id: number, data: any) => apiClient.put(`/api/staff/${id}/`, data),
  
  deleteStaff: (id: number) => apiClient.delete(`/api/staff/${id}/`),
  
  getSchedule: (restaurantId: number) =>
    apiClient.get(`/dashboard/staff/restaurant/${restaurantId}/schedule/`),
};

// === VENDOR MANAGEMENT APIs ===
export const vendorAPI = {
  getVendors: () => apiClient.get('/api/vendors/'),
  
  createVendor: (data: any) => apiClient.post('/api/vendors/', data),
  
  updateVendor: (id: number, data: any) => apiClient.put(`/api/vendors/${id}/`, data),
  
  deleteVendor: (id: number) => apiClient.delete(`/api/vendors/${id}/`),
  
  getVendorDashboard: (vendorId: number) =>
    apiClient.get(`/dashboard/vendor/${vendorId}/dashboard/`),
  
  getRestaurantVendors: (restaurantId: number) =>
    apiClient.get(`/dashboard/restaurant/${restaurantId}/vendors/`),
};

// === NOTIFICATION APIs ===
export const notificationAPI = {
  getNotifications: (restaurantId?: number) => {
    const params = restaurantId ? { restaurant: restaurantId } : {};
    return apiClient.get('/api/notifications/', { params });
  },
  
  getUserNotifications: () => apiClient.get('/dashboard/notifications/user/'),
  
  markAsRead: (id: number) => 
    apiClient.post(`/api/notifications/${id}/mark-read/`),
  
  createNotification: (restaurantId: number, data: any) =>
    apiClient.post(`/dashboard/notifications/restaurant/${restaurantId}/create/`, data),
};

// === EXPENSE TRACKING APIs ===
export const expenseAPI = {
  getExpenses: (restaurantId?: number) => {
    const params = restaurantId ? { restaurant: restaurantId } : {};
    return apiClient.get('/api/expenses/', { params });
  },
  
  createExpense: (data: any) => apiClient.post('/api/expenses/', data),
  
  updateExpense: (id: number, data: any) => apiClient.put(`/api/expenses/${id}/`, data),
  
  deleteExpense: (id: number) => apiClient.delete(`/api/expenses/${id}/`),
};

// === WASTE TRACKING APIs ===
export const wasteAPI = {
  getWasteEntries: (restaurantId?: number) => {
    const params = restaurantId ? { restaurant: restaurantId } : {};
    return apiClient.get('/api/waste/', { params });
  },
  
  createWasteEntry: (data: any) => apiClient.post('/api/waste/', data),
  
  updateWasteEntry: (id: number, data: any) => apiClient.put(`/api/waste/${id}/`, data),
  
  deleteWasteEntry: (id: number) => apiClient.delete(`/api/waste/${id}/`),
};

// === ANALYTICS APIs ===
export const analyticsAPI = {
  getRestaurantAnalytics: (restaurantId: number) =>
    apiClient.get(`/api/analytics/restaurant/${restaurantId}/`),
  
  getInventoryAlerts: (restaurantId: number) =>
    apiClient.get(`/api/analytics/inventory-alerts/${restaurantId}/`),
};

// === RESTAURANT MANAGEMENT APIs ===
export const restaurantAPI = {
  getRestaurants: () => apiClient.get('/restaurants/'),
  
  createRestaurant: (data: any) => apiClient.post('/restaurants/', data),
  
  updateRestaurant: (id: number, data: any) => 
    apiClient.put(`/restaurants/${id}/`, data),
  
  deleteRestaurant: (id: number) => apiClient.delete(`/restaurants/${id}/`),
};

// Export default API client for custom requests
export default apiClient;
