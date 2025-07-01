/**
 * Updated Authentication Hook using Django API with Role-based Login
 */
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance for auth
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add response interceptor for token handling
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// User type definition
type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'manager' | 'staff' | 'kitchen' | 'waiter';
  phone?: string;
  restaurants?: any[];
  restaurant_id?: number;
  staff_profile?: any;
  is_admin?: boolean;
  is_owner?: boolean;
  is_staff?: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  adminLogin: (email: string, password: string) => Promise<void>;
  ownerLogin: (email: string, password: string) => Promise<void>;
  staffLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  getAccessToken: () => string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthAPI = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthAPI must be used within an AuthAPIProvider');
  }
  return context;
};

interface AuthAPIProviderProps {
  children: React.ReactNode;
}

export const AuthAPIProvider: React.FC<AuthAPIProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Get access token
  const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token');
  };

  // Set auth headers
  const setAuthHeaders = (token: string) => {
    authAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // Clear auth data
  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    delete authAPI.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Admin login
  const adminLogin = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.post('/auth/admin/login/', {
        email,
        password
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Store tokens and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set auth headers
      setAuthHeaders(access_token);

      // Update state
      setUser(userData);

      toast.success(`Welcome back, ${userData.name}!`);
      navigate('/admin');

    } catch (error: any) {
      console.error('Admin login error:', error);
      const errorMessage = error.response?.data?.error || 'Admin login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Owner login
  const ownerLogin = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.post('/auth/owner/login/', {
        email,
        password
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Store tokens and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set auth headers
      setAuthHeaders(access_token);

      // Update state
      setUser(userData);

      toast.success(`Welcome back, ${userData.name}!`);
      navigate('/owner');

    } catch (error: any) {
      console.error('Owner login error:', error);
      const errorMessage = error.response?.data?.error || 'Owner login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Staff login
  const staffLogin = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.post('/auth/staff/login/', {
        email,
        password
      });

      const { access_token, refresh_token, user: userData } = response.data;

      // Store tokens and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Set auth headers
      setAuthHeaders(access_token);

      // Update state
      setUser(userData);

      toast.success(`Welcome back, ${userData.name}!`);
      
      // Navigate based on role
      if (userData.role === 'manager') {
        navigate('/manager');
      } else if (userData.role === 'kitchen') {
        navigate('/kitchen');
      } else {
        navigate('/staff');
      }

    } catch (error: any) {
      console.error('Staff login error:', error);
      const errorMessage = error.response?.data?.error || 'Staff login failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await authAPI.post('/auth/logout/', {
          refresh_token: refreshToken
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  // Verify token
  const verifyToken = async (): Promise<boolean> => {
    try {
      const token = getAccessToken();
      if (!token) return false;

      setAuthHeaders(token);
      const response = await authAPI.get('/auth/verify/');
      
      if (response.data.user) {
        setUser(response.data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuthData();
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        const storedUser = localStorage.getItem('user');
        const token = getAccessToken();
        
        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setAuthHeaders(token);
          
          // Verify token is still valid
          const isValid = await verifyToken();
          if (isValid) {
            setUser(userData);
          } else {
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    adminLogin,
    ownerLogin,
    staffLogin,
    logout,
    verifyToken,
    getAccessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default useAuthAPI;
