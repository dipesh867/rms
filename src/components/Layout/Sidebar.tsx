import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Package, 
  ChefHat, 
  CreditCard,
  Settings,
  BarChart3,
  Hotel,
  Store,
  UserCheck,
  Clipboard,
  Utensils,
  Calendar,
  TrendingUp,
  Receipt,
  Truck,
  Star,
  Shield,
  Database,
  MessageSquare,
  Bell,
  Headphones,
  Globe,
  FileText,
  DollarSign,
  Zap,
  Building,
  Clock,
  MapPin,
  Coffee,
  QrCode,
  Split,
  Palette,
  LogOut,
  Menu,
  ArrowRight,
  ArrowLeft,
  X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, theme, logout } = useApp();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Listen for window resize events
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Combine all menu items from different roles
  const getMenuItems = () => {
  const baseItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  switch (user?.role) {
    case 'admin':
      return [
        ...baseItems,
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'vendors', icon: Store, label: 'Vendor Management' },
        { id: 'users', icon: Users, label: 'User Management' },
        { id: 'global-inventory', icon: Database, label: 'Global Inventory' },
        { id: 'system-settings', icon: Settings, label: 'System Settings' },
        { id: 'security', icon: Shield, label: 'Security' },
        { id: 'notifications', icon: Bell, label: 'Notifications' },
        { id: 'support', icon: Headphones, label: 'Support' },
        { id: 'marketplace', icon: Globe, label: 'Marketplace' },
        { id: 'reports', icon: FileText, label: 'Reports' },
        { id: 'billing', icon: DollarSign, label: 'Billing' }
      ];
    
    case 'owner':
      return [
        ...baseItems,
        { id: 'pos', icon: ShoppingCart, label: 'POS Terminal' },
        { id: 'advanced-pos', icon: Split, label: 'Advanced POS' },
        { id: 'orders', icon: Clipboard, label: 'Order Management' },
        { id: 'tables', icon: Utensils, label: 'Table Management' },
        { id: 'qr-management', icon: QrCode, label: 'QR Management' },
        { id: 'menu', icon: ChefHat, label: 'Menu Builder' },
        { id: 'customers', icon: UserCheck, label: 'Customer Management' },
        { id: 'hotel', icon: Hotel, label: 'Hotel Management' },
        { id: 'inventory', icon: Package, label: 'Inventory Management' },
        { id: 'staff', icon: Users, label: 'Staff Management' },
        { id: 'vendor-website', icon: Palette, label: 'Website Builder' },
        { id: 'analytics', icon: TrendingUp, label: 'Business Analytics' },
        { id: 'billing', icon: Receipt, label: 'Billing & Payments' },
        { id: 'loyalty', icon: Star, label: 'Loyalty Program' },
        { id: 'expenses', icon: DollarSign, label: 'Expense Management' },
        { id: 'settings', icon: Settings, label: 'Restaurant Settings' }
      ];
    
    case 'kitchen':
      return [
        ...baseItems,
        { id: 'kitchen-orders', icon: ChefHat, label: 'Kitchen Display' },
        { id: 'inventory', icon: Package, label: 'Kitchen Inventory' },
        { id: 'recipes', icon: FileText, label: 'Recipe Management' },
        { id: 'waste', icon: Truck, label: 'Waste Management' },
        { id: 'schedule', icon: Clock, label: 'Kitchen Schedule' }
      ];
    
    case 'staff':
      return [
        ...baseItems,
        { id: 'pos', icon: ShoppingCart, label: 'POS Terminal' },
        { id: 'advanced-pos', icon: Split, label: 'Advanced POS' },
        { id: 'tables', icon: Utensils, label: 'My Tables' },
        { id: 'orders', icon: Clipboard, label: 'Active Orders' },
        { id: 'customers', icon: UserCheck, label: 'Customer Service' },
        { id: 'schedule', icon: Calendar, label: 'My Schedule' },
        { id: 'tips', icon: DollarSign, label: 'Tips & Earnings' }
      ];
    
    case 'vendor':
      return [
        ...baseItems,
        { id: 'vendor-orders', icon: Clipboard, label: 'My Orders' },
        { id: 'vendor-menu', icon: ChefHat, label: 'Menu Management' },
        { id: 'vendor-analytics', icon: BarChart3, label: 'Performance Analytics' },
        { id: 'vendor-reviews', icon: Star, label: 'Reviews & Ratings' },
        { id: 'vendor-inventory', icon: Package, label: 'Inventory' },
        { id: 'vendor-staff', icon: Users, label: 'Staff Management' },
        { id: 'vendor-billing', icon: Receipt, label: 'Billing & Payments' },
        { id: 'vendor-settings', icon: Settings, label: 'Store Settings' },
        { id: 'vendor-website', icon: Globe, label: 'Website Management' },
        { id: 'vendor-delivery', icon: MapPin, label: 'Delivery Management' }
      ];

    case 'manager':
      return [
        ...baseItems,
        { id: 'pos', icon: ShoppingCart, label: 'POS Terminal' },
        { id: 'advanced-pos', icon: Split, label: 'Advanced POS' },
        { id: 'pos-settings', icon: Settings, label: 'POS Settings' },
        { id: 'orders', icon: Clipboard, label: 'Order Management' },
        { id: 'tables', icon: Utensils, label: 'Table Management' },
        { id: 'qr-management', icon: QrCode, label: 'QR Management' },
        { id: 'menu', icon: ChefHat, label: 'Menu Builder' },
        { id: 'menu-ingredients', icon: Package, label: 'Menu-Ingredient Mapper' },
        { id: 'staff', icon: Users, label: 'Staff Management' },
        { id: 'payroll', icon: DollarSign, label: 'Payroll & Attendance' },
        { id: 'inventory', icon: Package, label: 'Inventory' },
        { id: 'customers', icon: UserCheck, label: 'Customer Management' },
        { id: 'sales-report', icon: BarChart3, label: 'Sales Report' },
        { id: 'inventory-report', icon: Truck, label: 'Inventory Report' },
        { id: 'staff-report', icon: FileText, label: 'Staff Report' },
        { id: 'settings', icon: Settings, label: 'Settings' }
      ];
    
    default:
      return baseItems;
  }
};

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className={`p-2 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-800 hover:bg-gray-100'
          } shadow-lg`}
          aria-label="Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-700' 
          : 'bg-white border-gray-200'
      } border-r transition-all duration-300 flex flex-col fixed lg:relative h-screen overflow-hidden z-40 ${
        mobileMenuOpen ? 'w-64 left-0' : 'w-0 -left-64 lg:w-64 lg:left-0'
      } ${
        collapsed ? 'lg:w-20' : 'lg:w-64'
      }`}>
        {/* Header */}
        <div className={`p-4 md:p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0 flex justify-between items-center`}>
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'space-x-3'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  RestaurantPro
                </h1>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } capitalize`}>
                  {user?.role || 'Demo'} Portal
                </p>
              </div>
            )}
          </div>
          {/* Only show on desktop */}
          <button 
            onClick={toggleSidebar}
            className={`lg:flex hidden p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700`}
          >
            {collapsed ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
          
          {/* Show on mobile only */}
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className={`lg:hidden p-1 rounded-lg ${
              theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  if (windowWidth < 1024) {
                    setMobileMenuOpen(false);
                  }
                }}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? theme === 'dark'
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive ? 'opacity-100' : 'opacity-75 group-hover:opacity-100'
                } transition-opacity duration-200 flex-shrink-0`} />
                {!collapsed && (
                  <span className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile Section - Fixed at bottom */}
        <div className={`p-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
          {!collapsed && (
            <div className={`flex items-center space-x-3 p-3 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
            } transition-colors duration-200 mb-3`}>
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.name || 'Demo User'}
                </p>
                <p className={`text-xs truncate ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } capitalize`}>
                  {user?.role || 'Guest'}
                </p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl text-left transition-all duration-200 ${
              theme === 'dark'
                ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                : 'text-red-600 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;