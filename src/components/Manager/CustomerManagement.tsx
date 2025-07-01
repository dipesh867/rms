import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Star,
  Gift,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Heart,
  Award,
  Clock,
  Download,
  Upload,
  X,
  Save
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dateOfBirth?: Date;
  anniversary?: Date;
  loyaltyPoints: number;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastVisit: Date;
  firstVisit: Date;
  preferences: {
    dietaryRestrictions?: string[];
    favoriteItems?: string[];
    allergies?: string[];
    preferredTable?: string;
    specialNotes?: string;
  };
  contactPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    promotions: boolean;
  };
  status: 'active' | 'inactive' | 'vip';
  tags: string[];
}

const CustomerManagement: React.FC = () => {
  const { theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [customers] = useState<Customer[]>([
    {
      id: 'CUST001',
      name: 'Alice Johnson',
      email: 'alice@email.com',
      phone: '+1234567890',
      address: '123 Main St, City, State 12345',
      dateOfBirth: new Date('1985-06-15'),
      loyaltyPoints: 2450,
      membershipTier: 'gold',
      totalOrders: 47,
      totalSpent: 2840.50,
      averageOrderValue: 60.43,
      lastVisit: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      firstVisit: new Date('2023-01-15'),
      preferences: {
        dietaryRestrictions: ['vegetarian'],
        favoriteItems: ['Margherita Pizza', 'Caesar Salad'],
        preferredTable: 'A2',
        specialNotes: 'Prefers window seating'
      },
      contactPreferences: {
        email: true,
        sms: true,
        push: false,
        promotions: true
      },
      status: 'vip',
      tags: ['frequent-visitor', 'vegetarian', 'birthday-club']
    },
    {
      id: 'CUST002',
      name: 'Bob Smith',
      email: 'bob@email.com',
      phone: '+1234567891',
      address: '456 Oak Ave, City, State 12345',
      loyaltyPoints: 890,
      membershipTier: 'silver',
      totalOrders: 23,
      totalSpent: 1205.75,
      averageOrderValue: 52.42,
      lastVisit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      firstVisit: new Date('2023-03-20'),
      preferences: {
        favoriteItems: ['Grilled Salmon', 'Beer'],
        allergies: ['shellfish'],
        specialNotes: 'Always orders beer with dinner'
      },
      contactPreferences: {
        email: true,
        sms: false,
        push: true,
        promotions: false
      },
      status: 'active',
      tags: ['seafood-lover', 'allergy-alert']
    },
    {
      id: 'CUST003',
      name: 'Carol Williams',
      email: 'carol@email.com',
      phone: '+1234567892',
      loyaltyPoints: 150,
      membershipTier: 'bronze',
      totalOrders: 5,
      totalSpent: 287.25,
      averageOrderValue: 57.45,
      lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      firstVisit: new Date('2023-11-10'),
      preferences: {
        specialNotes: 'New customer, first-time visitor'
      },
      contactPreferences: {
        email: true,
        sms: true,
        push: true,
        promotions: true
      },
      status: 'active',
      tags: ['new-customer']
    }
  ]);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferences: {
      dietaryRestrictions: [],
      favoriteItems: [],
      allergies: []
    },
    contactPreferences: {
      email: true,
      sms: false,
      push: false,
      promotions: false
    },
    status: 'active',
    tags: []
  });

  const tierOptions = [
    { value: 'all', label: 'All Tiers', count: customers.length },
    { value: 'platinum', label: 'Platinum', count: customers.filter(c => c.membershipTier === 'platinum').length },
    { value: 'gold', label: 'Gold', count: customers.filter(c => c.membershipTier === 'gold').length },
    { value: 'silver', label: 'Silver', count: customers.filter(c => c.membershipTier === 'silver').length },
    { value: 'bronze', label: 'Bronze', count: customers.filter(c => c.membershipTier === 'bronze').length }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'silver':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'bronze':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return <Award className="w-4 h-4" />;
      case 'gold':
        return <Star className="w-4 h-4" />;
      case 'silver':
        return <Gift className="w-4 h-4" />;
      case 'bronze':
        return <Heart className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'active':
        return 'bg-success-100 text-success-800 border-success-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesTier = selectedTier === 'all' || customer.membershipTier === selectedTier;
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const calculateLoyaltyProgression = (points: number) => {
    const tiers = { bronze: 0, silver: 500, gold: 1500, platinum: 3000 };
    
    if (points >= tiers.platinum) return { current: 'platinum', progress: 100, nextTier: null, pointsNeeded: 0 };
    if (points >= tiers.gold) return { current: 'gold', progress: ((points - tiers.gold) / (tiers.platinum - tiers.gold)) * 100, nextTier: 'platinum', pointsNeeded: tiers.platinum - points };
    if (points >= tiers.silver) return { current: 'silver', progress: ((points - tiers.silver) / (tiers.gold - tiers.silver)) * 100, nextTier: 'gold', pointsNeeded: tiers.gold - points };
    return { current: 'bronze', progress: (points / tiers.silver) * 100, nextTier: 'silver', pointsNeeded: tiers.silver - points };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Customer Management
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage customer relationships, loyalty programs, and preferences
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
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
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {customers.length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Customers
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
                ${customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()}
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
              <Star className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {customers.filter(c => c.membershipTier === 'gold' || c.membershipTier === 'platinum').length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                VIP Members
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
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${(customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length).toFixed(2)}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Order Value
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership Tier Distribution */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Membership Tier Distribution
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {tierOptions.slice(1).map((tier) => (
            <div key={tier.value} className={`p-4 rounded-lg text-center cursor-pointer transition-all duration-200 hover:scale-105 ${
              theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
            }`} onClick={() => setSelectedTier(tier.value)}>
              <div className="flex justify-center mb-2">
                {getTierIcon(tier.value)}
              </div>
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {tier.count}
              </div>
              <div className={`text-sm capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {tier.label}
              </div>
            </div>
          ))}
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
              placeholder="Search by name, email, or phone..."
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
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            {tierOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count})
              </option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            <option value="all">All Status</option>
            <option value="vip">VIP</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
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
                }`}>Customer</th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Membership</th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Orders</th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Total Spent</th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Loyalty Points</th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Last Visit</th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const loyaltyProgression = calculateLoyaltyProgression(customer.loyaltyPoints);
                
                return (
                  <tr key={customer.id} className={`border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {customer.email}
                          </div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {customer.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(customer.membershipTier)}`}>
                          <div className="flex items-center space-x-1">
                            {getTierIcon(customer.membershipTier)}
                            <span className="capitalize">{customer.membershipTier}</span>
                          </div>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                          {customer.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div>
                        <div className="font-medium">{customer.totalOrders}</div>
                        <div className="text-sm">
                          Avg: ${customer.averageOrderValue.toFixed(2)}
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-6 font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${customer.totalSpent.toLocaleString()}
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div>
                        <div className="font-medium">{customer.loyaltyPoints}</div>
                        {loyaltyProgression.nextTier && (
                          <div className="text-xs">
                            {loyaltyProgression.pointsNeeded} to {loyaltyProgression.nextTier}
                          </div>
                        )}
                        <div className={`w-full bg-gray-200 rounded-full h-1 mt-1 ${theme === 'dark' ? 'bg-gray-700' : ''}`}>
                          <div 
                            className="bg-primary-500 h-1 rounded-full"
                            style={{ width: `${loyaltyProgression.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <div className="text-sm">
                        <div>{customer.lastVisit.toLocaleDateString()}</div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{Math.floor((Date.now() - customer.lastVisit.getTime()) / (24 * 60 * 60 * 1000))} days ago</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowDetailsModal(true);
                          }}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors duration-200`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className={`p-2 rounded-lg ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-600 text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-600'
                        } transition-colors duration-200`}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className={`p-2 rounded-lg ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-600 text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-600'
                        } transition-colors duration-200`}>
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className={`p-2 rounded-lg ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-600 text-gray-300' 
                            : 'hover:bg-gray-100 text-gray-600'
                        } transition-colors duration-200`}>
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 max-h-screen overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Customer Profile - {selectedCustomer.name}
              </h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedCustomer.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedCustomer.phone}
                    </span>
                  </div>
                  {selectedCustomer.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedCustomer.address}
                      </span>
                    </div>
                  )}
                  {selectedCustomer.dateOfBirth && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {selectedCustomer.dateOfBirth.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Customer Statistics
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Orders
                    </span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCustomer.totalOrders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Spent
                    </span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${selectedCustomer.totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Avg Order Value
                    </span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${selectedCustomer.averageOrderValue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Loyalty Points
                    </span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCustomer.loyaltyPoints}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Member Since
                    </span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCustomer.firstVisit.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h4 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Preferences & Notes
                </h4>
                <div className="space-y-3">
                  {selectedCustomer.preferences.dietaryRestrictions && selectedCustomer.preferences.dietaryRestrictions.length > 0 && (
                    <div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Dietary Restrictions:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCustomer.preferences.dietaryRestrictions.map((restriction, index) => (
                          <span key={index} className="px-2 py-1 bg-warning-100 text-warning-800 text-xs rounded-full">
                            {restriction}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedCustomer.preferences.allergies && selectedCustomer.preferences.allergies.length > 0 && (
                    <div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Allergies:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCustomer.preferences.allergies.map((allergy, index) => (
                          <span key={index} className="px-2 py-1 bg-error-100 text-error-800 text-xs rounded-full">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCustomer.preferences.favoriteItems && selectedCustomer.preferences.favoriteItems.length > 0 && (
                    <div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Favorite Items:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedCustomer.preferences.favoriteItems.map((item, index) => (
                          <span key={index} className="px-2 py-1 bg-success-100 text-success-800 text-xs rounded-full">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCustomer.preferences.specialNotes && (
                    <div>
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Special Notes:
                      </span>
                      <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedCustomer.preferences.specialNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Tags */}
            {selectedCustomer.tags && selectedCustomer.tags.length > 0 && (
              <div className="mt-6">
                <h4 className={`text-lg font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Customer Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCustomer.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 max-h-screen overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Add New Customer
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={newCustomer.name || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <input
                  type="email"
                  value={newCustomer.email || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone || ''}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Status
                </label>
                <select
                  value={newCustomer.status || 'active'}
                  onChange={(e) => setNewCustomer(prev => ({ ...prev, status: e.target.value as any }))}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Address
              </label>
              <textarea
                value={newCustomer.address || ''}
                onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg border transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  console.log('Adding customer:', newCustomer);
                  setShowAddModal(false);
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;