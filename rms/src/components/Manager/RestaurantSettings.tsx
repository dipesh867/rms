import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Upload, 
  X, 
  Store, 
  MapPin, 
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  Percent,
  User,
  CreditCard,
  AlertCircle,
  Check
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

const RestaurantSettings: React.FC = () => {
  const { theme } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'basic' | 'operational' | 'pos' | 'notifications' | 'security'>('basic');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Restaurant data
  const [restaurant, setRestaurant] = useState({
    id: '',
    name: '',
    address: '',
    phone: '',
    email: '',
    logo_url: '',
    owner_id: '',
    status: 'active',
    created_at: '',
    opening_hours: {} as Record<string, { open: string, close: string, closed: boolean }>
  });
  
  // Settings
  const [settings, setSettings] = useState({
    currencySymbol: '$',
    taxRate: 10,
    serviceCharge: 5,
    roundingPreference: 'none',
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1001,
    enableTips: true,
    tipSuggestions: [10, 15, 18, 20],
    printReceipts: true,
    notifyLowStock: true,
    notifyOutOfStock: true,
    defaultPaymentMethod: 'cash',
    enabledPaymentMethods: ['cash', 'card', 'upi'],
    allowDiscounts: true,
    maxDiscountPercent: 25
  });

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  // Initialize opening hours if not set
  useEffect(() => {
    if (Object.keys(restaurant.opening_hours).length === 0) {
      const defaultHours = days.reduce((acc, day) => {
        acc[day] = { open: '09:00', close: '18:00', closed: false };
        return acc;
      }, {} as Record<string, { open: string, close: string, closed: boolean }>);
      
      setRestaurant(prev => ({
        ...prev,
        opening_hours: defaultHours
      }));
    }
  }, [restaurant.opening_hours]);

  // Load restaurant data
  useEffect(() => {
    const loadRestaurantData = async () => {
      if (!user?.restaurant_id) {
        toast.error('No restaurant associated with your account');
        return;
      }
      
      try {
        setIsLoading(true);
        
        // Fetch restaurant data
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', user.restaurant_id)
          .single();
        
        if (error) throw error;
        
        // Fetch opening hours from settings table
        const { data: hoursData, error: hoursError } = await supabase
          .from('restaurant_settings')
          .select('value')
          .eq('restaurant_id', user.restaurant_id)
          .eq('key', 'opening_hours')
          .single();
        
        if (hoursError && hoursError.code !== 'PGSQL_ERROR') {
          console.error('Error fetching opening hours:', hoursError);
        }
        
        // Fetch other settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('restaurant_settings')
          .select('key, value')
          .eq('restaurant_id', user.restaurant_id);
        
        if (settingsError) {
          console.error('Error fetching settings:', settingsError);
        }
        
        // Set restaurant data
        setRestaurant({
          ...data,
          opening_hours: hoursData?.value ? JSON.parse(hoursData.value) : {} 
        });
        
        // Set settings
        if (settingsData) {
          const settingsObj = settingsData.reduce((acc, setting) => {
            try {
              acc[setting.key] = JSON.parse(setting.value);
            } catch (e) {
              acc[setting.key] = setting.value;
            }
            return acc;
          }, {} as any);
          
          setSettings(prev => ({
            ...prev,
            ...settingsObj
          }));
        }
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        toast.error('Failed to load restaurant data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRestaurantData();
  }, [user]);

  // Handle restaurant data change
  const handleRestaurantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRestaurant(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
  };

  // Handle opening hours change
  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setRestaurant(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };
  
  // Handle settings change
  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };
  
  // Toggle payment method
  const togglePaymentMethod = (method: string) => {
    setSettings(prev => {
      const methods = prev.enabledPaymentMethods.includes(method)
        ? prev.enabledPaymentMethods.filter(m => m !== method)
        : [...prev.enabledPaymentMethods, method];
      
      return {
        ...prev,
        enabledPaymentMethods: methods
      };
    });
    setHasChanges(true);
  };

  // Save all changes
  const saveSettings = async () => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Update restaurant basic info
      const { error: restaurantError } = await supabase
        .from('restaurants')
        .update({
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          logo_url: restaurant.logo_url
        })
        .eq('id', restaurant.id);
      
      if (restaurantError) throw restaurantError;
      
      // Save opening hours to settings table
      const { error: hoursError } = await supabase
        .from('restaurant_settings')
        .upsert({
          restaurant_id: user.restaurant_id,
          key: 'opening_hours',
          value: JSON.stringify(restaurant.opening_hours)
        }, { onConflict: 'restaurant_id,key' });
      
      if (hoursError) throw hoursError;
      
      // Save other settings
      const settingsToUpsert = Object.entries(settings).map(([key, value]) => ({
        restaurant_id: user.restaurant_id,
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value.toString()
      }));
      
      const { error: settingsError } = await supabase
        .from('restaurant_settings')
        .upsert(settingsToUpsert, { onConflict: 'restaurant_id,key' });
      
      if (settingsError) throw settingsError;
      
      toast.success('Settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user?.restaurant_id) {
    return (
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 mx-auto text-error-500 mb-4" />
          <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            No Restaurant Associated
          </h3>
          <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Your account is not associated with any restaurant.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Restaurant Settings
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure your restaurant operations, POS system, and integrations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-warning-600 text-sm font-medium">
              Unsaved Changes
            </span>
          )}
          <button
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {[
            { id: 'basic', label: 'Basic Info', icon: Store },
            { id: 'operational', label: 'Operations', icon: Clock },
            { id: 'pos', label: 'POS Settings', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : theme === 'dark'
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Restaurant Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Restaurant Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={restaurant.name}
                  onChange={handleRestaurantChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="tel"
                    name="phone"
                    value={restaurant.phone}
                    onChange={handleRestaurantChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="email"
                    name="email"
                    value={restaurant.email}
                    onChange={handleRestaurantChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Website
                </label>
                <div className="relative">
                  <Globe className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="url"
                    name="logo_url"
                    value={restaurant.logo_url}
                    onChange={handleRestaurantChange}
                    placeholder="https://yourwebsite.com"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Address
              </label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-3 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <textarea
                  name="address"
                  value={restaurant.address}
                  onChange={handleRestaurantChange}
                  rows={3}
                  className={`w-full pl-10 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Logo Upload
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <Upload className={`w-8 h-8 mx-auto mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click to upload logo or drag and drop
                </p>
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  PNG, JPG up to 2MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Tab */}
      {activeTab === 'operational' && (
        <div className="space-y-6">
          {/* Opening Hours */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Opening Hours
            </h3>
            
            <div className="space-y-4">
              {days.map(day => (
                <div key={day} className="grid grid-cols-4 gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={!restaurant.opening_hours[day]?.closed}
                      onChange={(e) => handleHoursChange(day, 'closed', !e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className={`capitalize font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {day}
                    </span>
                  </div>
                  
                  <input
                    type="time"
                    value={restaurant.opening_hours[day]?.open || ''}
                    disabled={restaurant.opening_hours[day]?.closed}
                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                  
                  <input
                    type="time"
                    value={restaurant.opening_hours[day]?.close || ''}
                    disabled={restaurant.opening_hours[day]?.closed}
                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                    className={`px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                  
                  <span className={`text-sm ${
                    restaurant.opening_hours[day]?.closed 
                      ? 'text-red-500' 
                      : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {restaurant.opening_hours[day]?.closed ? 'Closed' : 'Open'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing Settings */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Billing & Tax Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Service Charge (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.serviceCharge}
                  onChange={(e) => handleSettingChange('serviceCharge', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Rounding Preference
                </label>
                <select
                  value={settings.roundingPreference}
                  onChange={(e) => handleSettingChange('roundingPreference', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  <option value="none">No Rounding</option>
                  <option value="nearest_50">Nearest $0.50</option>
                  <option value="nearest_100">Nearest $1.00</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => handleSettingChange('invoicePrefix', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                  Example: {settings.invoicePrefix}-0001
                </p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Next Invoice Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.nextInvoiceNumber}
                  onChange={(e) => handleSettingChange('nextInvoiceNumber', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
            </div>
          </div>
          
          {/* Service Features */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Service Features
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.printReceipts}
                  onChange={(e) => handleSettingChange('printReceipts', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Auto Print Receipts
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableTips}
                  onChange={(e) => handleSettingChange('enableTips', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Enable Tips
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowDiscounts}
                  onChange={(e) => handleSettingChange('allowDiscounts', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Allow Discounts
                </span>
              </label>
            </div>
            
            {settings.enableTips && (
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tip Suggestions (%)
                </label>
                <div className="flex flex-wrap gap-2">
                  {settings.tipSuggestions.map((tip, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={tip}
                        onChange={(e) => {
                          const newTips = [...settings.tipSuggestions];
                          newTips[index] = parseInt(e.target.value);
                          handleSettingChange('tipSuggestions', newTips);
                        }}
                        className={`w-16 px-2 py-1 rounded border text-center ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-1 focus:ring-primary-500`}
                      />
                      <Percent className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {settings.allowDiscounts && (
              <div className="mt-6">
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Maximum Discount (%)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.maxDiscountPercent}
                    onChange={(e) => handleSettingChange('maxDiscountPercent', parseInt(e.target.value))}
                    className={`w-24 px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                  <Percent className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POS Settings Tab */}
      {activeTab === 'pos' && (
        <div className="space-y-6">
          {/* Payment Methods */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Payment Methods
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Default Payment Method
                </label>
                <select
                  value={settings.defaultPaymentMethod}
                  onChange={(e) => handleSettingChange('defaultPaymentMethod', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Enabled Payment Methods
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cash', label: 'Cash' },
                    { id: 'card', label: 'Credit/Debit Card' },
                    { id: 'upi', label: 'UPI' },
                    { id: 'wallet', label: 'Digital Wallet' }
                  ].map(method => (
                    <label key={method.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enabledPaymentMethods.includes(method.id)}
                        onChange={() => togglePaymentMethod(method.id)}
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                        {method.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Receipt Customization */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Receipt Customization
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currencySymbol}
                  onChange={(e) => handleSettingChange('currencySymbol', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  maxLength={3}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Alert Settings
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyLowStock}
                  onChange={(e) => handleSettingChange('notifyLowStock', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notify on Low Stock
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifyOutOfStock}
                  onChange={(e) => handleSettingChange('notifyOutOfStock', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Notify on Out of Stock
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Security Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className={`text-base font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Password Reset
                </h4>
                <button
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
                >
                  Send Password Reset Email
                </button>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  This will send a password reset email to your registered email address.
                </p>
              </div>
              
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className={`text-base font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Access Control
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Staff can apply discounts
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        value="" 
                        className="sr-only peer" 
                        checked={true} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      Staff can void transactions
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        value="" 
                        className="sr-only peer" 
                        checked={false} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantSettings;