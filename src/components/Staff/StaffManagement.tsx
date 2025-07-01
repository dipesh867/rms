import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Clock, 
  DollarSign,
  Calendar,
  Star,
  Phone,
  Mail,
  MapPin,
  Download,
  Upload,
  Eye,
  Settings,
  Award,
  TrendingUp,
  X,
  Save
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'on-leave';
  hireDate: Date;
  salary: {
    base: number;
    type: 'hourly' | 'monthly' | 'commission';
    overtime: number;
    bonus: number;
    allowances: number;
    deductions: number;
  };
  schedule: {
    shift: 'morning' | 'afternoon' | 'night' | 'split';
    hoursPerWeek: number;
    workDays: string[];
  };
  performance: {
    rating: number;
    ordersHandled: number;
    customerRating: number;
    punctuality: number;
    attendance: number;
  };
  personalInfo: {
    address: string;
    emergencyContact: string;
    birthday: Date;
    joiningBonus: number;
  };
}

const StaffManagement: React.FC = () => {
  const { theme } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'payroll' | 'performance' | 'schedule'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [showPayrollModal, setShowPayrollModal] = useState(false);

  const departments = ['All', 'Kitchen', 'Service', 'Management', 'Cleaning', 'Delivery'];
  const roles = ['Waiter', 'Chef', 'Sous Chef', 'Manager', 'Cleaner', 'Delivery Boy', 'Cashier', 'Host'];

  const [staffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@restaurant.com',
      phone: '+1234567890',
      role: 'Head Chef',
      department: 'Kitchen',
      status: 'active',
      hireDate: new Date('2023-01-15'),
      salary: {
        base: 5500,
        type: 'monthly',
        overtime: 25,
        bonus: 500,
        allowances: 200,
        deductions: 100
      },
      schedule: {
        shift: 'morning',
        hoursPerWeek: 40,
        workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      performance: {
        rating: 4.8,
        ordersHandled: 1250,
        customerRating: 4.7,
        punctuality: 96,
        attendance: 98
      },
      personalInfo: {
        address: '123 Main St, City',
        emergencyContact: '+1234567891',
        birthday: new Date('1985-05-15'),
        joiningBonus: 1000
      }
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@restaurant.com',
      phone: '+1234567892',
      role: 'Senior Waiter',
      department: 'Service',
      status: 'active',
      hireDate: new Date('2023-03-20'),
      salary: {
        base: 18,
        type: 'hourly',
        overtime: 27,
        bonus: 300,
        allowances: 150,
        deductions: 50
      },
      schedule: {
        shift: 'afternoon',
        hoursPerWeek: 35,
        workDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      },
      performance: {
        rating: 4.6,
        ordersHandled: 890,
        customerRating: 4.8,
        punctuality: 94,
        attendance: 96
      },
      personalInfo: {
        address: '456 Oak Ave, City',
        emergencyContact: '+1234567893',
        birthday: new Date('1992-08-22'),
        joiningBonus: 500
      }
    }
  ]);

  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'active',
    salary: {
      base: 0,
      type: 'monthly',
      overtime: 0,
      bonus: 0,
      allowances: 0,
      deductions: 0
    },
    schedule: {
      shift: 'morning',
      hoursPerWeek: 40,
      workDays: []
    }
  });

  const filteredStaff = staffMembers.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || staff.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const calculateMonthlySalary = (staff: StaffMember) => {
    const { base, type, overtime, bonus, allowances, deductions } = staff.salary;
    let totalSalary = 0;

    if (type === 'monthly') {
      totalSalary = base;
    } else if (type === 'hourly') {
      totalSalary = base * staff.schedule.hoursPerWeek * 4.33; // Average weeks per month
    }

    totalSalary += overtime + bonus + allowances - deductions;
    return totalSalary;
  };

  const generatePayslip = (staff: StaffMember) => {
    const salary = calculateMonthlySalary(staff);
    console.log(`Generating payslip for ${staff.name} - $${salary.toFixed(2)}`);
    // Implementation for payslip generation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Staff Management
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Complete HR system with payroll and performance tracking
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <Upload className="w-4 h-4" />
            <span>Import Staff</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
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
                {staffMembers.length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Staff
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
                {staffMembers.filter(s => s.status === 'active').length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active Staff
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
              <DollarSign className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                ${staffMembers.reduce((total, staff) => total + calculateMonthlySalary(staff), 0).toLocaleString()}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Monthly Payroll
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
              <Star className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {(staffMembers.reduce((total, staff) => total + staff.performance.rating, 0) / staffMembers.length).toFixed(1)}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Staff Overview', icon: Users },
            { id: 'payroll', label: 'Payroll System', icon: DollarSign },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'schedule', label: 'Schedule', icon: Calendar }
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

      {/* Staff Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Search and Filters */}
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
                  placeholder="Search staff by name or email..."
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
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className={`px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept.toLowerCase()}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Staff Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <div key={staff.id} className={`p-6 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-gray-800 border border-gray-700' 
                  : 'bg-white border border-gray-200'
              } shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {staff.name}
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {staff.role}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    staff.status === 'active' 
                      ? 'bg-success-100 text-success-800' 
                      : staff.status === 'on-leave'
                      ? 'bg-warning-100 text-warning-800'
                      : 'bg-error-100 text-error-800'
                  }`}>
                    {staff.status.replace('-', ' ')}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {staff.email}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {staff.phone}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      ${calculateMonthlySalary(staff).toLocaleString()}/month
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {staff.performance.rating}/5.0 Rating
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <button
                    onClick={() => setSelectedStaff(staff)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Eye className="w-4 h-4 mx-auto" />
                  </button>
                  <button className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}>
                    <Edit className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => generatePayslip(staff)}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    <Download className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Monthly Payroll Summary
              </h3>
              <div className="flex space-x-2">
                <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm">
                  Export Payroll
                </button>
                <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">
                  Generate Payslips
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Staff</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Base Salary</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Overtime</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Bonus</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Deductions</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Total</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffMembers.map((staff) => (
                    <tr key={staff.id} className={`border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {staff.role}
                          </div>
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${staff.salary.base.toLocaleString()}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${staff.salary.overtime}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${staff.salary.bonus}
                      </td>
                      <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        ${staff.salary.deductions}
                      </td>
                      <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${calculateMonthlySalary(staff).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => generatePayslip(staff)}
                          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Generate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-3xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 max-h-screen overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Add New Staff Member
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
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Personal Information
                </h4>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newStaff.name || ''}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
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
                    value={newStaff.email || ''}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
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
                    value={newStaff.phone || ''}
                    onChange={(e) => setNewStaff(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Role
                    </label>
                    <select
                      value={newStaff.role || ''}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, role: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    >
                      <option value="">Select role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Department
                    </label>
                    <select
                      value={newStaff.department || ''}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, department: e.target.value }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    >
                      <option value="">Select department</option>
                      {departments.slice(1).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Salary Information
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Base Salary
                    </label>
                    <input
                      type="number"
                      value={newStaff.salary?.base || 0}
                      onChange={(e) => setNewStaff(prev => ({ 
                        ...prev, 
                        salary: { ...prev.salary!, base: parseFloat(e.target.value) || 0 }
                      }))}
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
                      Salary Type
                    </label>
                    <select
                      value={newStaff.salary?.type || 'monthly'}
                      onChange={(e) => setNewStaff(prev => ({ 
                        ...prev, 
                        salary: { ...prev.salary!, type: e.target.value as any }
                      }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="hourly">Hourly</option>
                      <option value="commission">Commission</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Shift
                    </label>
                    <select
                      value={newStaff.schedule?.shift || 'morning'}
                      onChange={(e) => setNewStaff(prev => ({ 
                        ...prev, 
                        schedule: { ...prev.schedule!, shift: e.target.value as any }
                      }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="night">Night</option>
                      <option value="split">Split</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Hours/Week
                    </label>
                    <input
                      type="number"
                      value={newStaff.schedule?.hoursPerWeek || 40}
                      onChange={(e) => setNewStaff(prev => ({ 
                        ...prev, 
                        schedule: { ...prev.schedule!, hoursPerWeek: parseInt(e.target.value) || 40 }
                      }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                    />
                  </div>
                </div>
              </div>
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
                  console.log('Adding staff:', newStaff);
                  setShowAddModal(false);
                }}
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Add Staff</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;