import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Settings, 
  Moon, 
  Sun, 
  User, 
  LogOut,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  Shield,
  CreditCard,
  UserCircle,
  ShoppingCart,
  X,
  Menu as MenuIcon
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import POSTerminal from '../POS/POSTerminal';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, theme, toggleTheme, notifications, logout } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showPOS, setShowPOS] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    setShowProfile(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'owner':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      case 'kitchen':
        return 'bg-orange-100 text-orange-800';
      case 'vendor':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Only show POS button for roles that need it
  const showPOSButton = user && (user.role === 'owner' || user.role === 'manager' || user.role === 'staff');

  return (
    <header className={`h-16 border-b ${
      theme === 'dark' 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    } flex items-center justify-between px-4 md:px-6 transition-colors duration-200 relative z-20`}>
      <div className="flex items-center space-x-4">
        <h1 className={`text-xl md:text-2xl font-bold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {/* POS Quick Button */}
        {showPOSButton && (
          <button 
            onClick={() => setShowPOS(!showPOS)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg flex items-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Quick POS</span>
          </button>
        )}

        {/* Search - Hidden on Mobile */}
        <div className="relative hidden md:block">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <input
            type="text"
            placeholder="Search..."
            className={`pl-10 pr-4 py-2 w-40 md:w-64 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200`}
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
              setShowMessages(false);
            }}
            className={`relative p-2 rounded-lg ${
              theme === 'dark' 
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            } transition-colors duration-200`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className={`absolute right-0 mt-2 w-80 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-lg shadow-xl z-50`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notifications
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                    !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}>
                    <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {notification.title}
                    </h4>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      {notification.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4">
                <button className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="relative hidden sm:block">
          <button 
            onClick={() => {
              setShowMessages(!showMessages);
              setShowNotifications(false);
              setShowProfile(false);
            }}
            className={`p-2 rounded-lg ${
              theme === 'dark' 
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            } transition-colors duration-200`}
            aria-label="Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Messages Dropdown */}
          {showMessages && (
            <div className={`absolute right-0 mt-2 w-80 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-lg shadow-xl z-50`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Messages
                </h3>
              </div>
              <div className="p-8 text-center">
                <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                }`} />
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No new messages
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button className={`p-2 rounded-lg hidden sm:block ${
          theme === 'dark' 
            ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
            : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
        } transition-colors duration-200`}
        aria-label="Help">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg ${
            theme === 'dark' 
              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          } transition-colors duration-200`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile Menu */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
              setShowMessages(false);
            }}
            className={`flex items-center space-x-2 p-1 md:p-2 rounded-lg ${
              theme === 'dark' 
                ? 'hover:bg-gray-800' 
                : 'hover:bg-gray-100'
            } transition-colors duration-200`}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500"
              />
            ) : (
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {user?.name}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${getRoleColor(user?.role || '')}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <ChevronDown className={`hidden md:block w-4 h-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className={`absolute right-0 mt-2 w-64 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-lg shadow-xl z-50`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user?.name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user?.email}
                    </p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${getRoleColor(user?.role || '')}`}>
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <button className={`w-full px-4 py-2 text-left flex items-center space-x-3 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-50 text-gray-700'
                } transition-colors duration-200`}>
                  <UserCircle className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
                
                <button className={`w-full px-4 py-2 text-left flex items-center space-x-3 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-50 text-gray-700'
                } transition-colors duration-200`}>
                  <CreditCard className="w-4 h-4" />
                  <span>Billing</span>
                </button>
                
                <button className={`w-full px-4 py-2 text-left flex items-center space-x-3 ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-50 text-gray-700'
                } transition-colors duration-200`}>
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                
                {user?.role === 'admin' && (
                  <button className={`w-full px-4 py-2 text-left flex items-center space-x-3 ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-gray-300' 
                      : 'hover:bg-gray-50 text-gray-700'
                  } transition-colors duration-200`}>
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                <button 
                  onClick={handleLogout}
                  className={`w-full px-4 py-2 text-left flex items-center space-x-3 ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700 text-red-400' 
                      : 'hover:bg-gray-50 text-red-600'
                  } transition-colors duration-200`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick POS Modal */}
      {showPOS && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className={`relative w-full max-w-7xl max-h-[90vh] overflow-y-auto rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-2xl`}>
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-inherit">
              <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Quick POS Terminal
              </h2>
              <button 
                onClick={() => setShowPOS(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <POSTerminal />
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showNotifications || showProfile || showMessages) && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => {
            setShowNotifications(false);
            setShowProfile(false);
            setShowMessages(false);
          }}
        ></div>
      )}
    </header>
  );
};

export default Header;