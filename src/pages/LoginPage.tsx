import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Store, 
  Shield, 
  Crown, 
  ChefHat, 
  Users, 
  Star,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCredential, setCopiedCredential] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  // Demo accounts (for testing)
  const userCredentials = {
    admin: {
      email: 'admin@restaurantpro.com',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin' as const,
      icon: Crown,
      color: 'bg-red-500',
      description: 'Full system access and vendor management'
    },
    owner: {
      email: 'owner@restaurant.com',
      password: 'owner123',
      name: 'Restaurant Owner',
      role: 'owner' as const,
      icon: Store,
      color: 'bg-purple-500',
      description: 'Complete restaurant management and POS access'
    },
    vendor: {
      email: 'vendor@restaurant.com',
      password: 'vendor123',
      name: 'Vendor Partner',
      role: 'vendor' as const,
      icon: Star,
      color: 'bg-yellow-500',
      description: 'Vendor dashboard and website management'
    },
    kitchen: {
      email: 'kitchen@restaurant.com',
      password: 'kitchen123',
      name: 'Kitchen Staff',
      role: 'kitchen' as const,
      icon: ChefHat,
      color: 'bg-orange-500',
      description: 'Kitchen display system and inventory'
    },
    staff: {
      email: 'staff@restaurant.com',
      password: 'staff123',
      name: 'Restaurant Staff',
      role: 'staff' as const,
      icon: Users,
      color: 'bg-green-500',
      description: 'POS access and table management'
    },
    manager: {
      email: 'manager@restaurant.com',
      password: 'manager123',
      name: 'Restaurant Manager',
      role: 'manager' as const,
      icon: Shield,
      color: 'bg-blue-500',
      description: 'Staff management and advanced POS features'
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      redirectBasedOnRole(user.role);
    }
  }, [user, navigate]);

  // Redirect based on user role
  const redirectBasedOnRole = (role: string) => {
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'owner') {
      navigate('/owner/dashboard');
    } else if (role === 'manager') {
      navigate('/manager/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleQuickLogin = (roleKey: string) => {
    const credentials = userCredentials[roleKey as keyof typeof userCredentials];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setSelectedRole(roleKey);
  };

  const copyCredentials = (e: React.MouseEvent, roleKey: string) => {
    e.stopPropagation();
    const credentials = userCredentials[roleKey as keyof typeof userCredentials];
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopiedCredential(roleKey);
    setTimeout(() => setCopiedCredential(''), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 dark:bg-gray-800 items-center justify-center p-8 relative">
        <div className="text-center relative z-10 max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">RestaurantPro</h1>
          <p className="text-lg text-white/90 mb-6">Complete POS & Management System</p>
          
          <div className="grid grid-cols-2 gap-4 text-white/80">
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm">Restaurants</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm">Orders Daily</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              Sign in to your RestaurantPro account
            </p>
          </div>

          {/* Demo Credentials Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Demo Accounts
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Click to use
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(userCredentials).map(([key, cred]) => {
                const Icon = cred.icon;
                return (
                  <div
                    key={key}
                    onClick={() => handleQuickLogin(key)}
                    className={`relative cursor-pointer ${
                      selectedRole === key
                        ? "bg-primary-50 border-primary-300 dark:bg-primary-900/20 dark:border-primary-500"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700/50 dark:border-gray-600 dark:hover:bg-gray-600/50"
                    } border rounded-lg p-3`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`w-8 h-8 ${cred.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                          {cred.name}
                        </h4>
                        <div className="mt-1">
                          <div className="text-xs font-mono truncate text-gray-700 dark:text-gray-300">
                            {cred.email}
                          </div>
                          <div className="text-xs font-mono text-gray-700 dark:text-gray-300">
                            {cred.password}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => copyCredentials(e, key)}
                        className={`p-1 rounded-lg ${
                          copiedCredential === key
                            ? "text-green-500"
                            : "text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                        title="Copy credentials"
                      >
                        {copiedCredential === key ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium flex justify-center items-center"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Sign In
                </span>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              <p>🔒 Demo System - All accounts are fully functional</p>
              <p>💡 Click any role above to auto-fill credentials</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;