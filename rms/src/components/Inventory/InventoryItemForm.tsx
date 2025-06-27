import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Package, 
  Calendar, 
  MapPin, 
  Hash, 
  Truck
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

interface InventoryItemFormProps {
  initialData?: any;
  onSave: () => void;
  onCancel: () => void;
}

const InventoryItemForm: React.FC<InventoryItemFormProps> = ({ initialData, onSave, onCancel }) => {
  const { addInventoryItem, updateInventoryItem, convertUnit } = useInventory();
  const { theme } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    current_stock: 0,
    min_stock: 0,
    max_stock: 0,
    unit: '',
    cost_per_unit: 0,
    location: '',
    barcode: '',
    sku: '',
    supplier_id: '',
    expiry_date: ''
  });
  
  const categories = ['Vegetables', 'Dairy', 'Meat', 'Beverages', 'Condiments', 'Grains', 'Spices', 'Bakery', 'Frozen', 'Other'];
  const units = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'box', 'bottle', 'jar', 'can', 'pack', 'each'];
  
  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setSuppliers(data || []);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      }
    };
    
    fetchSuppliers();
  }, []);
  
  useEffect(() => {
    if (initialData) {
      // Format dates for input fields
      const expiryDate = initialData.expiry_date 
        ? new Date(initialData.expiry_date).toISOString().split('T')[0]
        : '';
        
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        current_stock: initialData.current_stock || 0,
        min_stock: initialData.min_stock || 0,
        max_stock: initialData.max_stock || 0,
        unit: initialData.unit || '',
        cost_per_unit: initialData.cost_per_unit || 0,
        location: initialData.location || '',
        barcode: initialData.barcode || '',
        sku: initialData.sku || '',
        supplier_id: initialData.supplier_id || '',
        expiry_date: expiryDate
      });
    }
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  // Handle unit change with automatic conversion
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    const oldUnit = formData.unit;
    
    // Only try to convert if we already have a unit
    if (oldUnit && oldUnit !== newUnit) {
      const newValue = convertUnit(formData.current_stock, oldUnit, newUnit);
      const newMinStock = convertUnit(formData.min_stock, oldUnit, newUnit);
      const newMaxStock = convertUnit(formData.max_stock, oldUnit, newUnit);
      const newCostPerUnit = convertCost(formData.cost_per_unit, oldUnit, newUnit);
      
      setFormData(prev => ({
        ...prev,
        unit: newUnit,
        current_stock: newValue,
        min_stock: newMinStock,
        max_stock: newMaxStock,
        cost_per_unit: newCostPerUnit
      }));
    } else {
      // Just update the unit if no conversion needed
      setFormData(prev => ({ ...prev, unit: newUnit }));
    }
  };
  
  const convertValue = (value: number, fromUnit: string, toUnit: string): number => {
    // Use the convertUnit function from useInventory hook
    return convertUnit(value, fromUnit, toUnit);
  };
  
  const convertCost = (cost: number, fromUnit: string, toUnit: string): number => {
    // If same unit category but different scale
    if (
      (fromUnit === 'kg' && toUnit === 'g') ||
      (fromUnit === 'L' && toUnit === 'ml')
    ) {
      return cost / 1000;
    } else if (
      (fromUnit === 'g' && toUnit === 'kg') ||
      (fromUnit === 'ml' && toUnit === 'L')
    ) {
      return cost * 1000;
    }
    
    // For incompatible units, don't convert
    return cost;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Convert form data to match API expectations
      const itemData = {
        ...formData,
        // Convert empty strings to null
        barcode: formData.barcode || null,
        sku: formData.sku || null,
        location: formData.location || null,
        expiry_date: formData.expiry_date || null,
        supplier_id: formData.supplier_id || null
      };
      
      if (initialData?.id) {
        // Update existing item
        await updateInventoryItem(initialData.id, itemData);
      } else {
        // Add new item
        await addInventoryItem(itemData);
      }
      
      onSave();
      toast.success(initialData ? 'Item updated successfully' : 'Item added successfully');
    } catch (error) {
      console.error('Error saving inventory item:', error);
      toast.error('Failed to save inventory item');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Basic Information
          </h4>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Item Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category*
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Current Stock*
              </label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Unit*
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleUnitChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Inventory Control
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Minimum Stock*
              </label>
              <input
                type="number"
                name="min_stock"
                value={formData.min_stock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Maximum Stock*
              </label>
              <input
                type="number"
                name="max_stock"
                value={formData.max_stock}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Cost Per Unit* ($)
            </label>
            <input
              type="number"
              name="cost_per_unit"
              value={formData.cost_per_unit}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cost per {formData.unit} (will automatically adjust if unit changes)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Supplier
            </label>
            <select
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Expiry Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className="w-full pl-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Barcode
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              name="barcode"
              value={formData.barcode}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            SKU
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Storage Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <span className="flex items-center">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </span>
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <span className="flex items-center">
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : initialData ? 'Update Item' : 'Add Item'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default InventoryItemForm;