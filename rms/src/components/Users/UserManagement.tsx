import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Shield,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Settings
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'manager' | 'staff' | 'kitchen' | 'vendor' | 'customer';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: Date;
  createdAt: Date;
  avatar?: string;
  phone?: string;
  permissions: string[];
  department?: string;
}

const UserManagement: React.FC = () => {
  const { theme } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const users: User[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john@restaurantpro.com',
      role: 'admin',
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date('2023-01-15'),
      phone: '+1234567890',
      permissions: ['full-access'],
      department: 'Management'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@restaurant.com',
      role: 'owner',
      status: 'active',
      lastLogin: new Date(Date.now() - 30 * 60 * 1000),
      createdAt: new Date('2023-02-20'),
      phone: '+1234567891',
      permissions: ['restaurant-management', 'staff-management'],
      department: 'Operations'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@kitchen.com',
      role: 'kitchen',
      status: 'active',
      lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
      createdAt: new Date('2023-03-10'),
      phone: '+1234567892',
      permissions: ['kitchen-display', 'inventory-view'],
      department: 'Kitchen'
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma@staff.com',
      role: 'staff',
      status: 'active',
      lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000),
      createdAt: new Date('2023-04-05'),
      phone: '+1234567893',
      permissions: ['pos-access', 'table-management'],
      department: 'Service'
    },
    {
      id: '5',
      name: 'David Brown',
      email: 'david@vendor.com',
      role: 'vendor',
      status: 'inactive',
      lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date('2023-05-12'),
      phone: '+1234567894',
      permissions: ['vendor-dashboard', 'menu-management'],
      department: 'External'
    }
  ];

  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'owner', label: 'Owner' },
    { value: 'manager', label: 'Manager' },
    { value: 'staff', label: 'Staff' },
    { value: 'kitchen', label: 'Kitchen' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'customer', label: 'Customer' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

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
      case 'customer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4" />;
      case 'owner':
        return <Shield className="w-4 h-4" />;
      case 'manager':
        return <Settings className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatLastLogin = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            User Management
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage system users, roles, and permissions
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
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
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {users.length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Users
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
              <UserCheck className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Users
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
              <UserX className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {users.filter(u => u.status === 'inactive').length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Inactive Users
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
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Admins
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
              placeholder="Search users..."
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
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-gray-50 border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
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
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users List */}
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
                  User
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Role
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Status
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Department
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Last Login
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Created
                </th>
                <th className={`text-left py-4 px-6 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`border-b ${
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
                        <h4 className="font-medium">{user.name}</h4>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      <div className="flex items-center space-x-1">
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'active' && <UserCheck className="w-3 h-3 inline mr-1" />}
                      {user.status === 'inactive' && <UserX className="w-3 h-3 inline mr-1" />}
                      <span className="capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className={`py-4 px-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {user.department}
                  </td>
                  <td className={`py-4 px-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td className={`py-4 px-6 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {user.createdAt.toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
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
                        <Shield className="w-4 h-4" />
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

export default UserManagement;