import React, { useState } from 'react';
import { Crown, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SuperUserSignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const [theme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'light';
  });

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Mock admin account creation (frontend only)
      setTimeout(() => {
        console.log('Mock admin creation:', {
          name,
          email,
          role: 'admin'
        });
        
        toast.success('Super admin account created successfully');
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className={`w-full max-w-md ${
        theme === 'dark' 
          ? 'bg-gray-800/90 backdrop-blur-xl border border-gray-700' 
          : 'bg-white/90 backdrop-blur-xl border border-gray-200'
      } rounded-2xl shadow-xl p-8`}>
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary-100 rounded-xl">
            <Crown className="w-10 h-10 text-primary-600" />
          </div>
        </div>
        
        <h2 className={`text-2xl font-bold text-center mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Create Super Admin Account
        </h2>
        <p className={`text-center text-sm mb-6 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Set up the primary administrator account
        </p>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Full Name
            </label>
            <div className="relative">
              <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="Enter your name"
                required
              />
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
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
                className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } hover:opacity-80`}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Confirm Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                placeholder="Confirm password"
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
          >
            {isLoading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
          
          <p className="text-center text-sm">
            <a 
              href="/login"
              className={`text-primary-500 hover:text-primary-600 font-medium ${
                theme === 'dark' ? 'text-primary-400 hover:text-primary-300' : ''
              }`}
            >
              Already have an account? Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SuperUserSignUp;