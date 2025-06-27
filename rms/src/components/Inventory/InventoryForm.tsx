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

interface InventoryFormProps {
  initialData?: any;
  onSave: () => void;
  onCancel: () => void;
}

const InventoryForm: React.FC<InventoryFormProps> = ({ initialData, onSave, onCancel }) => {
  const { addInventoryItem, updateInventoryItem } = useInventory();
  const [isLoading, setIsLoading] = useState(false);
  
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
    expiry_date: '',
    supplier_id: ''
  });
  
  const categories = ['Vegetables', 'Dairy', 'Meat', 'Beverages', 'Condiments', 'Grains', 'Spices', 'Bakery', 'Frozen', 'Other'];
  const units = ['kg', 'g', 'L', 'ml', 'pcs', 'dozen', 'box', 'bottle', 'jar', 'can', 'pack', 'each'];
  
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
        expiry_date: expiryDate,
        supplier_id: initialData.supplier_id || ''
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
    } catch (error) {
      console.error('Error saving inventory item:', error);
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
                onChange={handleChange}
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
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
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

export default InventoryForm;