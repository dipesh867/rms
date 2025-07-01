import React, { useState, useEffect } from 'react';
import { Save, X, Users, MapPin, Hash, PenTool, Plus, Minus, Layout, CarFront as ChairFront } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Table, Chair } from '../../types';

interface TableFormProps {
  initialData?: Table;
  onSave: (table: Table) => void;
  onCancel: () => void;
}

const TableForm: React.FC<TableFormProps> = ({ initialData, onSave, onCancel }) => {
  const { theme } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    number: '',
    capacity: 2,
    section: '',
    qrCode: '',
    shape: 'rectangle' as 'rectangle' | 'circle' | 'square',
  });

  const [chairs, setChairs] = useState<Chair[]>([]);
  
  const defaultSections = ['Main Dining', 'Patio', 'Bar', 'VIP', 'Private Dining', 'Terrace'];
  const shapes = ['rectangle', 'circle', 'square'];
  
  useEffect(() => {
    if (initialData) {
      setFormData({
        number: initialData.number || '',
        capacity: initialData.capacity || 2,
        section: initialData.section || '',
        qrCode: initialData.qrCode || '',
        shape: initialData.shape || 'rectangle',
      });

      // Load existing chairs
      if (initialData.chairs && initialData.chairs.length > 0) {
        setChairs(initialData.chairs);
      } else {
        // Generate default chairs based on capacity
        generateDefaultChairs(initialData.capacity || 2);
      }
    } else {
      // Generate default chairs for new table
      generateDefaultChairs(formData.capacity);
    }
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'capacity') {
      const newCapacity = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? newCapacity : value
      }));

      // Adjust chairs when capacity changes
      if (newCapacity > chairs.length) {
        // Add new chairs
        const newChairs = [...chairs];
        for (let i = chairs.length + 1; i <= newCapacity; i++) {
          newChairs.push({
            id: `temp-${Date.now()}-${i}`,
            number: `${i}`,
            status: 'available'
          });
        }
        setChairs(newChairs);
      } else if (newCapacity < chairs.length) {
        // Remove excess chairs
        setChairs(chairs.slice(0, newCapacity));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  const generateDefaultChairs = (capacity: number) => {
    const newChairs: Chair[] = [];
    for (let i = 1; i <= capacity; i++) {
      newChairs.push({
        id: `temp-${Date.now()}-${i}`,
        number: `${i}`,
        status: 'available'
      });
    }
    setChairs(newChairs);
  };

  const handleChairChange = (index: number, field: keyof Chair, value: any) => {
    setChairs(prev => {
      const newChairs = [...prev];
      newChairs[index] = {
        ...newChairs[index],
        [field]: value
      };
      return newChairs;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Create a complete table object with chair data
      const tableData: Omit<Table, 'id'> = {
        ...formData,
        status: initialData?.status || 'available',
        chairs,
      };
      
      if (initialData?.id) {
        tableData.id = initialData.id;
      }
      
      onSave(tableData as Table);
    } catch (error) {
      console.error('Error saving table:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Table Number*
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="A1, B2, etc."
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Capacity*
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="20"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Section*
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select Section</option>
              {defaultSections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Table Shape
          </label>
          <div className="relative">
            <Layout className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            <select
              name="shape"
              value={formData.shape}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {shapes.map((shape) => (
                <option key={shape} value={shape}>
                  {shape.charAt(0).toUpperCase() + shape.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            QR Code URL
          </label>
          <input
            type="text"
            name="qrCode"
            value={formData.qrCode}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="https://example.com/qr/table-a1"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Optional: URL for the table's QR code
          </p>
        </div>
      </div>

      {/* Chair Configuration Section */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <ChairFront className="w-5 h-5 mr-2" />
            Chair Configuration
          </h3>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Configure individual chairs for the table. This allows for separate orders per chair.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {chairs.map((chair, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                          Chair Number
                        </label>
                        <input
                          type="text"
                          value={chair.number}
                          onChange={(e) => handleChairChange(index, 'number', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">
                          Status
                        </label>
                        <select
                          value={chair.status}
                          onChange={(e) => handleChairChange(index, 'status', e.target.value)}
                          className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="reserved">Reserved</option>
                          <option value="cleaning">Cleaning</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            {isLoading ? 'Saving...' : initialData ? 'Update Table' : 'Add Table'}
          </span>
        </button>
      </div>
    </form>
  );
};

export default TableForm;