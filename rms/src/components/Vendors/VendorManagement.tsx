import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Star,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  AlertTriangle,
  Users
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface Vendor {
  id: string;
  name: string;
  type: 'restaurant' | 'hotel' | 'cafe' | 'bar';
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive' | 'pending-approval' | 'suspended';
  rating: number;
  totalOrders: number;
  revenue: number;
  joinDate: Date;
  commission: number;
  logo?: string;
  cuisine: string[];
  deliveryRadius: number;
  minimumOrder: number;
}

const VendorManagement: React.FC = () => {
  const { theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const vendors: Vendor[] = [
    {
      id: '1',
      name: 'Bella Italia Restaurant',
      type: 'restaurant',
      email: 'info@bellaitalia.com',
      phone: '+1234567890',
      address: '123 Main St, Downtown',
      status: 'active',
      rating: 4.8,
      totalOrders: 1245,
      revenue: 85420.50,
      joinDate: new Date('2023-01-15'),
      commission: 12.5,
      cuisine: ['Italian', 'Mediterranean'],
      deliveryRadius: 5,
      minimumOrder: 25
    },
    {
      id: '2',
      name: 'The Grand Hotel',
      type: 'hotel',
      email: 'reservations@grandhotel.com',
      phone: '+1234567891',
      address: '456 Luxury Ave, Uptown',
      status: 'active',
      rating: 4.9,
      totalOrders: 2180,
      revenue: 195000.00,
      joinDate: new Date('2022-08-20'),
      commission: 15.0,
      cuisine: ['Fine Dining', 'Continental'],
      deliveryRadius: 10,
      minimumOrder: 50
    },
    {
      id: '3',
      name: 'Coffee Corner Cafe',
      type: 'cafe',
      email: 'hello@coffeecorner.com',
      phone: '+1234567892',
      address: '789 Bean St, Midtown',
      status: 'pending-approval',
      rating: 4.5,
      totalOrders: 0,
      revenue: 0,
      joinDate: new Date('2024-01-10'),
      commission: 10.0,
      cuisine: ['Coffee', 'Pastries'],
      deliveryRadius: 3,
      minimumOrder: 15
    }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending-approval', label: 'Pending Approval' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'cafe', label: 'Cafe' },
    { value: 'bar', label: 'Bar' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'pending-approval':
        return 'bg-warning-100 text-warning-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending-approval':
        return <AlertTriangle className="w-4 h-4" />;
      case 'suspended':
        return <Ban className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || vendor.status === selectedStatus;
    const matchesType = selectedType === 'all' || vendor.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Vendor Management
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and monitor all vendor partners
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {vendors.filter(v => v.status === 'active').length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Vendors
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                $280K
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Revenue
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {vendors.filter(v => v.status === 'pending-approval').length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Pending Approval
              </p>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                4.7
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Rating
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
            />
          </div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendors List */}
      <div className={`rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b ${
              theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              <tr>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Vendor
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Type
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Status
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Rating
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Orders
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Revenue
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Commission
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className={`border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
                  <td className={`py-4 px-6 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{vendor.name}</h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {vendor.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className={`py-4 px-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <span className="capitalize">{vendor.type}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(vendor.status)}
                        <span className="capitalize">{vendor.status.replace('-', ' ')}</span>
                      </div>
                    </span>
                  </td>
                  <td className={`py-4 px-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{vendor.rating}</span>
                    </div>
                  </td>
                  <td className={`py-4 px-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {vendor.totalOrders.toLocaleString()}
                  </td>
                  <td className={`py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    ${vendor.revenue.toLocaleString()}
                  </td>
                  <td className={`py-4 px-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {vendor.commission}%
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className={`p-1 rounded ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-600 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className={`p-1 rounded ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-600 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}>
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className={`p-1 rounded ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-600 text-gray-300' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}>
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VendorManagement;