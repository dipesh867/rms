import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Printer, 
  CreditCard, 
  Receipt, 
  DollarSign, 
  Percent, 
  Save,
  Grid,
  Bell,
  Box,
  Clock,
  User,
  Database,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

interface POSConfig {
  general: {
    invoicePrefix: string;
    nextInvoiceNumber: number;
    tableReservationEnabled: boolean;
    qrOrderingEnabled: boolean;
    soundEffects: boolean;
    roundingPreference: 'none' | 'nearest_50' | 'nearest_100';
  };
  billing: {
    currencySymbol: string;
    defaultTax: number;
    serviceCharge: number;
    tipEnabled: boolean;
    tipSuggestions: number[];
    discountTypes: string[];
    receiptFooter: string;
    includeLogoOnReceipt: boolean;
  };
  printer: {
    enabled: boolean;
    printerName: string;
    receiptSize: '58mm' | '80mm' | 'A4';
    printServerIP: string;
    autoPrintOnOrderComplete: boolean;
    printKitchenReceipt: boolean;
    printCustomerReceipt: boolean;
  };
  payment: {
    enabledMethods: string[];
    defaultPaymentMethod: string;
    cardTerminalEnabled: boolean;
    cardTerminalIP: string;
    onlinePaymentEnabled: boolean;
    splitBillEnabled: boolean;
    mergeBillEnabled: boolean;
  };
  security: {
    requirePinForDiscount: boolean;
    requirePinForVoid: boolean;
    requirePinForRefund: boolean;
    pinCode: string;
  };
}

const POSSettings: React.FC = () => {
  const { theme } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'billing' | 'printer' | 'payment' | 'security'>('general');
  const [showPinCode, setShowPinCode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [config, setConfig] = useState<POSConfig>({
    general: {
      invoicePrefix: 'INV',
      nextInvoiceNumber: 1001,
      tableReservationEnabled: true,
      qrOrderingEnabled: true,
      soundEffects: true,
      roundingPreference: 'none'
    },
    billing: {
      currencySymbol: '$',
      defaultTax: 10,
      serviceCharge: 5,
      tipEnabled: true,
      tipSuggestions: [10, 15, 18, 20],
      discountTypes: ['percentage', 'fixed amount', 'item specific'],
      receiptFooter: 'Thank you for dining with us! Visit again soon.',
      includeLogoOnReceipt: true
    },
    printer: {
      enabled: true,
      printerName: 'EPSON TM-T20III',
      receiptSize: '80mm',
      printServerIP: '192.168.1.100',
      autoPrintOnOrderComplete: true,
      printKitchenReceipt: true,
      printCustomerReceipt: true
    },
    payment: {
      enabledMethods: ['cash', 'card', 'upi', 'wallet'],
      defaultPaymentMethod: 'cash',
      cardTerminalEnabled: true,
      cardTerminalIP: '192.168.1.101',
      onlinePaymentEnabled: true,
      splitBillEnabled: true,
      mergeBillEnabled: true
    },
    security: {
      requirePinForDiscount: true,
      requirePinForVoid: true,
      requirePinForRefund: true,
      pinCode: '1234'
    }
  });

  // Load POS settings on mount
  useEffect(() => {
    const loadPOSSettings = async () => {
      if (!user?.restaurant_id) {
        toast.error('No restaurant associated with your account');
        return;
      }
      
      try {
        // Fetch POS settings
        const { data, error } = await supabase
          .from('pos_settings')
          .select('key, value')
          .eq('restaurant_id', user.restaurant_id);
        
        if (error) throw error;
        
        // Transform data into config object
        if (data && data.length > 0) {
          const settingsObject = data.reduce((acc, setting) => {
            try {
              // Determine the section by splitting the key
              const [section, key] = setting.key.split('.');
              
              if (!acc[section]) acc[section] = {};
              
              // Parse the value (could be string, number, boolean, or array)
              let parsedValue;
              try {
                parsedValue = JSON.parse(setting.value);
              } catch (e) {
                parsedValue = setting.value;
              }
              
              acc[section][key] = parsedValue;
            } catch (e) {
              console.error('Error parsing setting:', e);
            }
            return acc;
          }, {} as any);
          
          // Merge with default settings
          setConfig(prev => ({
            general: { ...prev.general, ...settingsObject.general },
            billing: { ...prev.billing, ...settingsObject.billing },
            printer: { ...prev.printer, ...settingsObject.printer },
            payment: { ...prev.payment, ...settingsObject.payment },
            security: { ...prev.security, ...settingsObject.security }
          }));
        }
      } catch (error) {
        console.error('Error loading POS settings:', error);
        toast.error('Failed to load POS settings');
      }
    };
    
    loadPOSSettings();
  }, [user]);

  const paymentMethods = [
    { id: 'cash', name: 'Cash' },
    { id: 'card', name: 'Credit/Debit Card' },
    { id: 'upi', name: 'UPI' },
    { id: 'wallet', name: 'Digital Wallet' },
    { id: 'bank', name: 'Bank Transfer' },
    { id: 'cheque', name: 'Cheque' }
  ];

  const updateConfig = (section: keyof POSConfig, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const updateNestedConfig = (section: keyof POSConfig, field: string, index: number, value: any) => {
    setConfig(prev => {
      const updatedArray = [...prev[section][field]];
      updatedArray[index] = value;
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: updatedArray
        }
      };
    });
    setHasChanges(true);
  };

  const togglePaymentMethod = (method: string) => {
    const methods = config.payment.enabledMethods;
    const newMethods = methods.includes(method)
      ? methods.filter(m => m !== method)
      : [...methods, method];
    
    updateConfig('payment', 'enabledMethods', newMethods);
  };

  const saveSettings = async () => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Format settings for database
      const settingsToUpsert = [];
      
      // Process each section of the config
      for (const [section, settings] of Object.entries(config)) {
        for (const [key, value] of Object.entries(settings)) {
          settingsToUpsert.push({
            restaurant_id: user.restaurant_id,
            key: `${section}.${key}`,
            value: typeof value === 'object' ? JSON.stringify(value) : String(value)
          });
        }
      }
      
      // Save to database
      const { error } = await supabase
        .from('pos_settings')
        .upsert(settingsToUpsert, { onConflict: 'restaurant_id,key' });
      
      if (error) throw error;
      
      toast.success('POS settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving POS settings:', error);
      toast.error('Failed to save POS settings');
    } finally {
      setIsSaving(false);
    }
  };

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
            POS System Settings
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure your point of sale system settings and preferences
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
            { id: 'general', label: 'General', icon: Settings },
            { id: 'billing', label: 'Billing', icon: Receipt },
            { id: 'printer', label: 'Printer', icon: Printer },
            { id: 'payment', label: 'Payment', icon: CreditCard },
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

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            General POS Settings
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  value={config.general.invoicePrefix}
                  onChange={(e) => updateConfig('general', 'invoicePrefix', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Example: {config.general.invoicePrefix}-{config.general.nextInvoiceNumber}
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
                  value={config.general.nextInvoiceNumber}
                  onChange={(e) => updateConfig('general', 'nextInvoiceNumber', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
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
                Rounding Preference
              </label>
              <select
                value={config.general.roundingPreference}
                onChange={(e) => updateConfig('general', 'roundingPreference', e.target.value)}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.general.tableReservationEnabled}
                  onChange={(e) => updateConfig('general', 'tableReservationEnabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <Grid className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Enable Table Reservation
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.general.qrOrderingEnabled}
                  onChange={(e) => updateConfig('general', 'qrOrderingEnabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <Box className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Enable QR Ordering
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.general.soundEffects}
                  onChange={(e) => updateConfig('general', 'soundEffects', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <Bell className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Enable Sound Effects
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Billing Settings */}
      {activeTab === 'billing' && (
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Billing Settings
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={config.billing.currencySymbol}
                  onChange={(e) => updateConfig('billing', 'currencySymbol', e.target.value)}
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
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={config.billing.defaultTax}
                  onChange={(e) => updateConfig('billing', 'defaultTax', parseFloat(e.target.value))}
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
                  Service Charge (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={config.billing.serviceCharge}
                  onChange={(e) => updateConfig('billing', 'serviceCharge', parseFloat(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Tip Suggestions (%)
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.billing.tipEnabled}
                    onChange={(e) => updateConfig('billing', 'tipEnabled', e.target.checked)}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Enable Tips
                  </span>
                </label>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {config.billing.tipSuggestions.map((tip, index) => (
                  <input
                    key={index}
                    type="number"
                    min="0"
                    max="100"
                    value={tip}
                    onChange={(e) => updateNestedConfig('billing', 'tipSuggestions', index, parseFloat(e.target.value))}
                    disabled={!config.billing.tipEnabled}
                    className={`px-3 py-2 rounded-lg border text-center ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-600'
                        : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Receipt Footer Message
              </label>
              <textarea
                value={config.billing.receiptFooter}
                onChange={(e) => updateConfig('billing', 'receiptFooter', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.billing.includeLogoOnReceipt}
                  onChange={(e) => updateConfig('billing', 'includeLogoOnReceipt', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Include Logo on Receipt
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Printer Settings */}
      {activeTab === 'printer' && (
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Printer Settings
            </h3>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.printer.enabled}
                onChange={(e) => updateConfig('printer', 'enabled', e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Enable Printer
              </span>
            </label>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Printer Name
                </label>
                <input
                  type="text"
                  value={config.printer.printerName}
                  onChange={(e) => updateConfig('printer', 'printerName', e.target.value)}
                  disabled={!config.printer.enabled}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Print Server IP
                </label>
                <input
                  type="text"
                  value={config.printer.printServerIP}
                  onChange={(e) => updateConfig('printer', 'printServerIP', e.target.value)}
                  disabled={!config.printer.enabled}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Receipt Size
              </label>
              <select
                value={config.printer.receiptSize}
                onChange={(e) => updateConfig('printer', 'receiptSize', e.target.value as any)}
                disabled={!config.printer.enabled}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <option value="58mm">58mm Thermal</option>
                <option value="80mm">80mm Thermal</option>
                <option value="A4">A4 Paper</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.printer.autoPrintOnOrderComplete}
                  onChange={(e) => updateConfig('printer', 'autoPrintOnOrderComplete', e.target.checked)}
                  disabled={!config.printer.enabled}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${
                  !config.printer.enabled ? 'opacity-50' : ''
                }`}>
                  Auto Print on Completion
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.printer.printKitchenReceipt}
                  onChange={(e) => updateConfig('printer', 'printKitchenReceipt', e.target.checked)}
                  disabled={!config.printer.enabled}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${
                  !config.printer.enabled ? 'opacity-50' : ''
                }`}>
                  Print Kitchen Receipt
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.printer.printCustomerReceipt}
                  onChange={(e) => updateConfig('printer', 'printCustomerReceipt', e.target.checked)}
                  disabled={!config.printer.enabled}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${
                  !config.printer.enabled ? 'opacity-50' : ''
                }`}>
                  Print Customer Receipt
                </span>
              </label>
            </div>

            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Test Printer
              </h4>
              <div className="flex space-x-3">
                <button
                  disabled={!config.printer.enabled}
                  className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Test Receipt</span>
                </button>
                <button
                  disabled={!config.printer.enabled}
                  className={`px-4 py-2 rounded-lg border transition-colors duration-200 flex items-center space-x-2 ${
                    theme === 'dark'
                      ? 'border-gray-600 hover:bg-gray-600 text-gray-300'
                      : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Database className="w-4 h-4" />
                  <span>Check Connection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Payment Settings
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-3 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Enabled Payment Methods
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {paymentMethods.map(method => (
                  <label key={method.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.payment.enabledMethods.includes(method.id)}
                      onChange={() => togglePaymentMethod(method.id)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {method.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Default Payment Method
              </label>
              <select
                value={config.payment.defaultPaymentMethod}
                onChange={(e) => updateConfig('payment', 'defaultPaymentMethod', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                {config.payment.enabledMethods.map(method => (
                  <option key={method} value={method}>
                    {paymentMethods.find(m => m.id === method)?.name || method}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Card Terminal Settings
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.payment.cardTerminalEnabled}
                      onChange={(e) => updateConfig('payment', 'cardTerminalEnabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Enable Terminal
                    </span>
                  </label>
                </div>
                <input
                  type="text"
                  value={config.payment.cardTerminalIP}
                  onChange={(e) => updateConfig('payment', 'cardTerminalIP', e.target.value)}
                  disabled={!config.payment.cardTerminalEnabled}
                  placeholder="Terminal IP Address"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white disabled:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-900 disabled:bg-gray-100'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Advanced Payment Options
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.payment.onlinePaymentEnabled}
                      onChange={(e) => updateConfig('payment', 'onlinePaymentEnabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Enable Online Payment
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.payment.splitBillEnabled}
                      onChange={(e) => updateConfig('payment', 'splitBillEnabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Enable Bill Splitting
                    </span>
                  </label>
                  
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.payment.mergeBillEnabled}
                      onChange={(e) => updateConfig('payment', 'mergeBillEnabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Enable Bill Merging
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Security Settings
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.security.requirePinForDiscount}
                  onChange={(e) => updateConfig('security', 'requirePinForDiscount', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Require PIN for Discounts
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.security.requirePinForVoid}
                  onChange={(e) => updateConfig('security', 'requirePinForVoid', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Require PIN for Void
                </span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.security.requirePinForRefund}
                  onChange={(e) => updateConfig('security', 'requirePinForRefund', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Require PIN for Refund
                </span>
              </label>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Security PIN Code
              </label>
              <div className="relative">
                <input
                  type={showPinCode ? 'text' : 'password'}
                  value={config.security.pinCode}
                  onChange={(e) => updateConfig('security', 'pinCode', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowPinCode(!showPinCode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPinCode ? (
                    <EyeOff className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  ) : (
                    <Eye className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  )}
                </button>
              </div>
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                This PIN will be required for sensitive operations like applying discounts or processing refunds.
              </p>
            </div>

            <div className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-semibold mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Security Recommendation
              </h4>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                For best security practices, we recommend changing your PIN regularly and using a combination of numbers that isn't easily guessable.
                Never share your PIN with unauthorized personnel.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSSettings;