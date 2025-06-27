import React, { useState } from 'react';
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
import { useApp } from '../../contexts/AppContext';

const LoginPage: React.FC = () => {
  const { login, theme } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCredential, setCopiedCredential] = useState<string>('');

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

  const handleQuickLogin = (roleKey: string) => {
    const credentials = userCredentials[roleKey as keyof typeof userCredentials];
    setEmail(credentials.email);
    setPassword(credentials.password);
    setSelectedRole(roleKey);
  };

  const copyCredentials = (roleKey: string) => {
    const credentials = userCredentials[roleKey as keyof typeof userCredentials];
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopiedCredential(roleKey);
    setTimeout(() => setCopiedCredential(''), 2000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const credential = Object.values(userCredentials).find(
        cred => cred.email === email && cred.password === password
      );

      if (credential) {
        login({
          id: Date.now().toString(),
          name: credential.name,
          email: credential.email,
          role: credential.role,
          avatar: `https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150&h=150&fit=crop&crop=face`,
          status: 'active',
          lastLogin: new Date()
        });
      } else {
        alert('Invalid credentials! Please use the demo accounts provided.');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className={`h-screen overflow-hidden flex ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Left Panel - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-primary-600 to-purple-700'
      } items-center justify-center p-8 relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="text-center relative z-10 max-w-md">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
              <Store className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">RestaurantPro</h1>
          <p className="text-lg text-white/90 mb-6">Complete POS & Management System for Modern Restaurants</p>
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-2 gap-4 text-white/80">
            <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-sm">Restaurants</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">50K+</div>
              <div className="text-sm">Orders Daily</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm">Uptime</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className={`w-full max-w-xl ${
          theme === 'dark' 
            ? 'bg-gray-800/90 backdrop-blur-xl border border-gray-700' 
            : 'bg-white/90 backdrop-blur-xl border border-gray-200'
        } rounded-3xl shadow-2xl p-6`}>
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Welcome Back
            </h2>
            <p className={`text-sm mt-1 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sign in to your RestaurantPro account
            </p>
          </div>

          {/* Demo Credentials Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-base font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Demo Accounts
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
              }`}>
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
                    className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedRole === key
                        ? theme === 'dark'
                          ? 'bg-primary-600/20 border-primary-500 shadow-lg'
                          : 'bg-primary-50 border-primary-300 shadow-lg'
                        : theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-600/50'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    } border rounded-lg p-3`}
                  >
                    <div className="flex items-start space-x-2">
                      <div className={`w-8 h-8 ${cred.color} rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {cred.name}
                        </h4>
                        <div className="mt-1">
                          <div className={`text-xs font-mono truncate ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {cred.email}
                          </div>
                          <div className={`text-xs font-mono ${
                            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {cred.password}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCredentials(key);
                        }}
                        className={`p-1 rounded-lg transition-colors duration-200 ${
                          copiedCredential === key
                            ? 'text-green-500'
                            : theme === 'dark'
                              ? 'hover:bg-gray-600 text-gray-300'
                              : 'hover:bg-gray-200 text-gray-600'
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
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-10 py-2 rounded-xl border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-base`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  } transition-colors duration-200`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium text-base transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-3 shadow-lg"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center">
            <div className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
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