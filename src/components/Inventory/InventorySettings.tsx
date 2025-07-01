import React, { useState, useEffect } from 'react';
import {
  Save,
  Settings,
  Package,
  AlertCircle,
  Check,
  ArrowRightLeft,
  Clock,
  Upload,
  Download
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import { useInventory } from '../../hooks/useInventory';
import toast from 'react-hot-toast';

interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
}

interface InventorySettings {
  lowStockThreshold: number;
  autoReorderEnabled: boolean;
  autoReorderThreshold: number;
  trackExpiryDates: boolean;
  expiryNotificationDays: number;
  defaultUnit: string;
  enableBarcodeScanning: boolean;
  inventoryCountFrequency: 'daily' | 'weekly' | 'monthly';
  unitConversions: UnitConversion[];
  wasteTrackingEnabled: boolean;
  costCalculationMethod: 'fifo' | 'lifo' | 'average';
  allowNegativeStock: boolean;
}

const InventorySettings: React.FC = () => {
  const { theme } = useApp();
  const { user } = useAuth();
  const { getUnitConversions } = useInventory();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const unitOptions = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'box', 'bottle', 'jar', 'can', 'pack', 'each'];
  
  const [settings, setSettings] = useState<InventorySettings>({
    lowStockThreshold: 10,
    autoReorderEnabled: false,
    autoReorderThreshold: 5,
    trackExpiryDates: true,
    expiryNotificationDays: 7,
    defaultUnit: 'pcs',
    enableBarcodeScanning: false,
    inventoryCountFrequency: 'weekly',
    unitConversions: [
      { fromUnit: 'kg', toUnit: 'g', factor: 1000 },
      { fromUnit: 'L', toUnit: 'ml', factor: 1000 }
    ],
    wasteTrackingEnabled: true,
    costCalculationMethod: 'fifo',
    allowNegativeStock: false
  });
  
  const [newConversion, setNewConversion] = useState<UnitConversion>({
    fromUnit: 'kg',
    toUnit: 'g',
    factor: 1000
  });

  // Load settings on mount
  useEffect(() => {
    const loadInventorySettings = async () => {
      if (!user?.restaurant_id) {
        toast.error('No restaurant associated with your account');
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch inventory settings
        const { data, error } = await supabase
          .from('inventory_settings')
          .select('*')
          .eq('restaurant_id', user.restaurant_id)
          .single();
        
        if (error && error.code !== 'PGSQL_ERROR') {
          console.error('Error fetching inventory settings:', error);
        }
        
        // Get default unit conversions
        const defaultConversions = Object.entries(getUnitConversions())
          .filter(([unit, conversion]) => conversion.factor !== 1) // Skip identity conversions
          .map(([unit, conversion]) => ({
            fromUnit: unit,
            toUnit: conversion.base,
            factor: conversion.factor
          }));
        
        // If settings exist, use them
        if (data) {
          setSettings({
            lowStockThreshold: data.low_stock_threshold || 10,
            autoReorderEnabled: data.auto_reorder_enabled || false,
            autoReorderThreshold: data.auto_reorder_threshold || 5,
            trackExpiryDates: data.track_expiry_dates || true,
            expiryNotificationDays: data.expiry_notification_days || 7,
            defaultUnit: data.default_unit || 'pcs',
            enableBarcodeScanning: data.enable_barcode_scanning || false,
            inventoryCountFrequency: data.inventory_count_frequency || 'weekly',
            unitConversions: data.unit_conversions || defaultConversions,
            wasteTrackingEnabled: data.waste_tracking_enabled || true,
            costCalculationMethod: data.cost_calculation_method || 'fifo',
            allowNegativeStock: data.allow_negative_stock || false
          });
        } else {
          // Use defaults with proper unit conversions
          setSettings(prev => ({
            ...prev,
            unitConversions: defaultConversions
          }));
        }
      } catch (error) {
        console.error('Error loading inventory settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadInventorySettings();
  }, [user]);

  // Handle settings change
  const handleSettingChange = (key: keyof InventorySettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };
  
  // Handle conversion input change
  const handleConversionChange = (field: keyof UnitConversion, value: any) => {
    setNewConversion(prev => ({
      ...prev,
      [field]: field === 'factor' ? parseFloat(value) : value
    }));
  };
  
  // Add new conversion
  const handleAddConversion = () => {
    // Validate conversion
    if (newConversion.fromUnit === newConversion.toUnit) {
      toast.error('From and To units must be different');
      return;
    }
    
    if (newConversion.factor <= 0) {
      toast.error('Conversion factor must be greater than 0');
      return;
    }
    
    // Check if conversion already exists
    if (settings.unitConversions.some(
      c => c.fromUnit === newConversion.fromUnit && c.toUnit === newConversion.toUnit
    )) {
      toast.error('This conversion already exists');
      return;
    }
    
    // Add new conversion
    setSettings(prev => ({
      ...prev,
      unitConversions: [...prev.unitConversions, { ...newConversion }]
    }));
    
    // Reset form
    setNewConversion({
      fromUnit: 'kg',
      toUnit: 'g',
      factor: 1000
    });
    
    setHasChanges(true);
  };
  
  // Remove conversion
  const handleRemoveConversion = (index: number) => {
    setSettings(prev => ({
      ...prev,
      unitConversions: prev.unitConversions.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  // Save settings
  const saveSettings = async () => {
    if (!user?.restaurant_id) {
      toast.error('No restaurant associated with your account');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('inventory_settings')
        .upsert({
          restaurant_id: user.restaurant_id,
          low_stock_threshold: settings.lowStockThreshold,
          auto_reorder_enabled: settings.autoReorderEnabled,
          auto_reorder_threshold: settings.autoReorderThreshold,
          track_expiry_dates: settings.trackExpiryDates,
          expiry_notification_days: settings.expiryNotificationDays,
          default_unit: settings.defaultUnit,
          enable_barcode_scanning: settings.enableBarcodeScanning,
          inventory_count_frequency: settings.inventoryCountFrequency,
          unit_conversions: settings.unitConversions,
          waste_tracking_enabled: settings.wasteTrackingEnabled,
          cost_calculation_method: settings.costCalculationMethod,
          allow_negative_stock: settings.allowNegativeStock
        });
      
      if (error) throw error;
      
      toast.success('Inventory settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving inventory settings:', error);
      toast.error('Failed to save inventory settings');
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
            Inventory Settings
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Configure inventory management preferences and unit conversions
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Management */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Package className="w-5 h-5 mr-2" />
            Stock Management
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Low Stock Threshold (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.lowStockThreshold}
                onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Items will be marked as low stock when they fall below this percentage of their maximum stock
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Auto-Reorder When Low
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.autoReorderEnabled}
                  onChange={(e) => handleSettingChange('autoReorderEnabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            {settings.autoReorderEnabled && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Auto-Reorder Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.autoReorderThreshold}
                  onChange={(e) => handleSettingChange('autoReorderThreshold', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Track Expiry Dates
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.trackExpiryDates}
                  onChange={(e) => handleSettingChange('trackExpiryDates', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            {settings.trackExpiryDates && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Expiry Notification Days Before
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.expiryNotificationDays}
                  onChange={(e) => handleSettingChange('expiryNotificationDays', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Track Waste
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.wasteTrackingEnabled}
                  onChange={(e) => handleSettingChange('wasteTrackingEnabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Allow Negative Stock Levels
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.allowNegativeStock}
                  onChange={(e) => handleSettingChange('allowNegativeStock', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Cost Calculation Method
              </label>
              <select
                value={settings.costCalculationMethod}
                onChange={(e) => handleSettingChange('costCalculationMethod', e.target.value as any)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <option value="fifo">FIFO (First In First Out)</option>
                <option value="lifo">LIFO (Last In First Out)</option>
                <option value="average">Weighted Average</option>
              </select>
            </div>
          </div>
        </div>

        {/* Unit Settings */}
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <ArrowRightLeft className="w-5 h-5 mr-2" />
            Unit Settings
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Default Unit
              </label>
              <select
                value={settings.defaultUnit}
                onChange={(e) => handleSettingChange('defaultUnit', e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                {unitOptions.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                Enable Barcode Scanning
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.enableBarcodeScanning}
                  onChange={(e) => handleSettingChange('enableBarcodeScanning', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Inventory Count Frequency
              </label>
              <select
                value={settings.inventoryCountFrequency}
                onChange={(e) => handleSettingChange('inventoryCountFrequency', e.target.value as any)}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            {/* Unit Conversions */}
            <div className="mt-8">
              <h4 className={`text-base font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Unit Conversions
              </h4>
              
              <div className="grid grid-cols-5 gap-2 mb-2">
                <div className="col-span-2">
                  <label className={`block text-xs mb-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>From Unit</label>
                </div>
                <div className="col-span-2">
                  <label className={`block text-xs mb-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>To Unit</label>
                </div>
                <div className="col-span-1">
                  <label className={`block text-xs mb-1 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>Factor</label>
                </div>
              </div>
              
              {/* Add new conversion */}
              <div className="grid grid-cols-5 gap-2 mb-4">
                <select
                  value={newConversion.fromUnit}
                  onChange={(e) => handleConversionChange('fromUnit', e.target.value)}
                  className={`col-span-2 px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  {unitOptions.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                
                <select
                  value={newConversion.toUnit}
                  onChange={(e) => handleConversionChange('toUnit', e.target.value)}
                  className={`col-span-2 px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  {unitOptions.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                
                <input
                  type="number"
                  min="0.000001"
                  step="0.000001"
                  value={newConversion.factor}
                  onChange={(e) => handleConversionChange('factor', e.target.value)}
                  className={`col-span-1 px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
              </div>
              
              <button
                onClick={handleAddConversion}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg mb-4"
              >
                Add Conversion
              </button>
              
              {/* Conversion list */}
              {settings.unitConversions.length > 0 ? (
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  {settings.unitConversions.map((conversion, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center mb-2 last:mb-0"
                    >
                      <div className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        1 {conversion.fromUnit} = {conversion.factor} {conversion.toUnit}
                      </div>
                      <button
                        onClick={() => handleRemoveConversion(index)}
                        className="text-error-500 hover:text-error-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                } text-center`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    No conversions added yet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bulk Operations */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Bulk Operations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className={`text-base font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Import/Export
            </h4>
            <div className="flex space-x-3">
              <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Import Inventory</span>
              </button>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export Inventory</span>
              </button>
            </div>
          </div>
          
          <div>
            <h4 className={`text-base font-medium mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Inventory Count
            </h4>
            <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Next scheduled inventory count: <span className="font-medium">August 15, 2025</span>
            </p>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">
              Start Inventory Count Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySettings;