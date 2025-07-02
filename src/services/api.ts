/**
 * API Service for Restaurant Management System
 * Handles all API calls to the Django backend
 */

const API_BASE_URL = 'http://localhost:8000/api';

// Types
export interface RestaurantData {
  name: string;
  email: string;
  address: string;
  phone: string;
  owner: {
    name: string;
    email: string;
    password: string;
  };
}

export interface DashboardStats {
  system_health: {
    current: number;
    change: string;
  };
  restaurants: {
    total: number;
    change: string;
  };
  users: {
    total: number;
    active: number;
    change: string;
  };
  vendors: {
    total: number;
    change: string;
  };
  last_updated: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    restaurants?: Array<{
      id: number;
      name: string;
      address: string;
    }>;
  };
}

// API Helper function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = localStorage.getItem('access_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// === RESTAURANT APIs ===
export const restaurantAPI = {
  /**
   * Create a new restaurant with owner account
   */
  create: async (data: RestaurantData) => {
    return apiCall('/superadmin/restaurants/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all restaurants (admin only)
   */
  getAll: async () => {
    return apiCall('/superadmin/restaurants/');
  },
};

// === DASHBOARD APIs ===
export const dashboardAPI = {
  /**
   * Get admin dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    return apiCall('/dashboard-stats/');
  },

  /**
   * Get system health percentage
   */
  getSystemHealth: async () => {
    return apiCall('/superadmin/system-health/');
  },

  /**
   * Get active restaurants count
   */
  getRestaurantCount: async () => {
    return apiCall('/superadmin/active-restaurants/');
  },
};

// === AUTHENTICATION APIs ===
export const authAPI = {
  /**
   * Admin login
   */
  adminLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiCall('/superadmin/auth/admin/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Owner login
   */
  ownerLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiCall('/superadmin/auth/owner/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Staff login
   */
  staffLogin: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiCall('/superadmin/auth/staff/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Logout
   */
  logout: async (refreshToken: string) => {
    return apiCall('/superadmin/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  /**
   * Verify token
   */
  verifyToken: async () => {
    return apiCall('/superadmin/auth/verify/');
  },
};

// === OWNER DASHBOARD APIs ===
export const ownerAPI = {
  /**
   * Get owner dashboard stats for a specific restaurant
   */
  getDashboardStats: async (restaurantId: number) => {
    return apiCall(`/owner/restaurant/${restaurantId}/`);
  },

  /**
   * Get restaurant analytics
   */
  getAnalytics: async (restaurantId: number, days: number = 30) => {
    return apiCall(`/owner/restaurant/${restaurantId}/analytics/?days=${days}`);
  },

  /**
   * Create expense
   */
  createExpense: async (restaurantId: number, expenseData: any) => {
    return apiCall(`/owner/restaurant/${restaurantId}/expenses/create/`, {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  },
};

// === KITCHEN DASHBOARD APIs ===
export const kitchenAPI = {
  /**
   * Get kitchen dashboard stats
   */
  getDashboardStats: async (restaurantId: number) => {
    return apiCall(`/kitchen/restaurant/${restaurantId}/`);
  },
};

// === STAFF DASHBOARD APIs ===
export const staffAPI = {
  /**
   * Get staff dashboard stats
   */
  getDashboardStats: async (restaurantId: number) => {
    return apiCall(`/staff/restaurant/${restaurantId}/`);
  },

  /**
   * Get table management data
   */
  getTables: async (restaurantId: number) => {
    return apiCall(`/staff/restaurant/${restaurantId}/tables/`);
  },

  /**
   * Update table status
   */
  updateTableStatus: async (restaurantId: number, tableId: number, status: string) => {
    return apiCall(`/staff/restaurant/${restaurantId}/tables/${tableId}/update-status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  },
};

// === VENDOR DASHBOARD APIs ===
export const vendorAPI = {
  /**
   * Get vendor dashboard stats
   */
  getDashboardStats: async (vendorId: number) => {
    return apiCall(`/vendor/${vendorId}/`);
  },
};

export default {
  restaurant: restaurantAPI,
  dashboard: dashboardAPI,
  auth: authAPI,
  owner: ownerAPI,
  kitchen: kitchenAPI,
  staff: staffAPI,
  vendor: vendorAPI,
};
