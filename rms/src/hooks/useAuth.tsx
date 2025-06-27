import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Define user type without Supabase dependencies
type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'owner' | 'manager' | 'staff' | 'kitchen' | 'vendor' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at?: string;
  avatar_url?: string;
  phone?: string;
  department?: string;
  restaurant_id?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Demo credentials for testing
  const demoCredentials = [
    { email: 'admin@restaurantpro.com', password: 'admin123', role: 'admin', restaurant_id: null },
    { email: 'owner@restaurant.com', password: 'owner123', role: 'owner', restaurant_id: 'demo-restaurant-1' },
    { email: 'manager@restaurant.com', password: 'manager123', role: 'manager', restaurant_id: 'demo-restaurant-1' },
    { email: 'staff@restaurant.com', password: 'staff123', role: 'staff', restaurant_id: 'demo-restaurant-1' },
    { email: 'kitchen@restaurant.com', password: 'kitchen123', role: 'kitchen', restaurant_id: 'demo-restaurant-1' },
    { email: 'vendor@restaurant.com', password: 'vendor123', role: 'vendor', restaurant_id: 'demo-restaurant-1' }
  ];

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user data:', e);
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);

    // Listen for storage events from other tabs
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

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Check if this matches a demo account
      const demoUser = demoCredentials.find(cred => cred.email === email && cred.password === password);
      
      if (demoUser) {
        // Create a user object for the demo account
        const userData = {
          id: Date.now().toString(),
          name: demoUser.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          email: demoUser.email,
          role: demoUser.role as any,
          status: 'active',
          avatar_url: `https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150&h=150&fit=crop&crop=face`,
          restaurant_id: demoUser.restaurant_id,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);
        
        // Navigate based on role
        if (demoUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (demoUser.role === 'owner') {
          navigate('/owner/dashboard');
        } else if (demoUser.role === 'manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // If not a demo user, show error
        toast.error('Invalid credentials. Please use one of the demo accounts.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // In a frontend-only app, we'll just show a success message
      toast.success('Account created successfully! (Demo mode)');
      navigate('/login');
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An error occurred during sign out');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // In a frontend-only app, we'll just show a success message
      toast.success('Password reset instructions would be sent to your email (Demo mode)');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An error occurred during password reset');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }

    try {
      setIsLoading(true);
      
      // For demo users stored in localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating your profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};