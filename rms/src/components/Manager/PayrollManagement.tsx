import React, { useState } from 'react';
import { 
  Users, 
  DollarSign,
  Download,
  Filter,
  Mail,
  Printer,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Eye,
  Save,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  Settings
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface StaffPayroll {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  salaryType: 'monthly' | 'hourly' | 'commission';
  baseSalary: number;
  allowances: {
    type: string;
    amount: number;
  }[];
  deductions: {
    type: string;
    amount: number;
  }[];
  overtimeHours: number;
  overtimeRate: number;
  bonus: number;
  totalHoursWorked: number;
  totalDaysWorked: number;
  totalDaysInMonth: number;
  month: string;
  year: number;
  paymentStatus: 'pending' | 'paid' | 'processing';
  paymentDate?: Date;
  paymentMethod?: string;
  notes?: string;
  totalAmount: number;
}

interface StaffAttendance {
  id: string;
  staffId: string;
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'half-day' | 'leave';
  leaveType?: 'casual' | 'sick' | 'paid' | 'unpaid';
  notes?: string;
  totalHours?: number;
}

const PayrollManagement: React.FC = () => {
  const { theme, staff } = useApp();
  const [activeTab, setActiveTab] = useState<'payroll' | 'attendance' | 'leaves' | 'settings'>('payroll');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<StaffPayroll | null>(null);
  
  // Mock payroll data
  const [payrollData] = useState<StaffPayroll[]>([
    {
      id: '1',
      staffId: '1',
      staffName: 'John Smith',
      role: 'Chef',
      salaryType: 'monthly',
      baseSalary: 5000,
      allowances: [
        { type: 'housing', amount: 200 },
        { type: 'transport', amount: 100 }
      ],
      deductions: [
        { type: 'tax', amount: 500 },
        { type: 'insurance', amount: 100 }
      ],
      overtimeHours: 12,
      overtimeRate: 15,
      bonus: 300,
      totalHoursWorked: 176,
      totalDaysWorked: 22,
      totalDaysInMonth: 30,
      month: 'April',
      year: 2025,
      paymentStatus: 'paid',
      paymentDate: new Date('2025-05-01'),
      paymentMethod: 'bank transfer',
      totalAmount: 5180
    },
    {
      id: '2',
      staffId: '2',
      staffName: 'Sarah Johnson',
      role: 'Waiter',
      salaryType: 'hourly',
      baseSalary: 15,
      allowances: [
        { type: 'meals', amount: 120 }
      ],
      deductions: [
        { type: 'tax', amount: 180 }
      ],
      overtimeHours: 8,
      overtimeRate: 22.5,
      bonus: 100,
      totalHoursWorked: 160,
      totalDaysWorked: 20,
      totalDaysInMonth: 30,
      month: 'April',
      year: 2025,
      paymentStatus: 'pending',
      totalAmount: 2500
    }
  ]);

  // Mock attendance data
  const [attendanceData] = useState<StaffAttendance[]>([
    {
      id: '1',
      staffId: '1',
      date: new Date('2025-04-01'),
      checkIn: new Date('2025-04-01T09:00:00'),
      checkOut: new Date('2025-04-01T18:00:00'),
      status: 'present',
      totalHours: 9
    },
    {
      id: '2',
      staffId: '1',
      date: new Date('2025-04-02'),
      checkIn: new Date('2025-04-02T09:15:00'),
      checkOut: new Date('2025-04-02T18:30:00'),
      status: 'present',
      totalHours: 9.25
    },
    {
      id: '3',
      staffId: '2',
      date: new Date('2025-04-01'),
      checkIn: new Date('2025-04-01T10:00:00'),
      checkOut: new Date('2025-04-01T17:00:00'),
      status: 'present',
      totalHours: 7
    },
    {
      id: '4',
      staffId: '2',
      date: new Date('2025-04-02'),
      status: 'absent',
      notes: 'Called in sick'
    }
  ]);

  // Filters for payroll data
  const filteredPayroll = payrollData.filter(payroll => {
    const matchesSearch = payroll.staffName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || payroll.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Calculate total of all selected payrolls
  const totalPayrollAmount = filteredPayroll.reduce((sum, payroll) => sum + payroll.totalAmount, 0);

  const generatePayslip = (payrollId: string) => {
    const payroll = payrollData.find(p => p.id === payrollId);
    if (payroll) {
      setSelectedPayroll(payroll);
      setShowPayslipModal(true);
    }
  };

  const downloadPayslip = () => {
    console.log('Downloading payslip for', selectedPayroll?.staffName);
    // Implementation for downloading payslip
  };

  const emailPayslip = () => {
    console.log('Emailing payslip to', selectedPayroll?.staffName);
    // Implementation for emailing payslip
  };

  const markAsPaid = (payrollId: string) => {
    console.log('Marking payroll as paid:', payrollId);
    // Implementation for marking as paid
  };

  // Calculate attendance summary for a staff member
  const getAttendanceSummary = (staffId: string) => {
    const staffAttendance = attendanceData.filter(a => a.staffId === staffId);
    
    const present = staffAttendance.filter(a => a.status === 'present').length;
    const absent = staffAttendance.filter(a => a.status === 'absent').length;
    const leave = staffAttendance.filter(a => a.status === 'leave').length;
    
    const totalWorkHours = staffAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    
    return { present, absent, leave, totalWorkHours };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Payroll Management
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage staff salaries, attendance, and payments
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              <option value="2025-01">January 2025</option>
              <option value="2025-02">February 2025</option>
              <option value="2025-03">March 2025</option>
              <option value="2025-04">April 2025</option>
              <option value="2025-05">May 2025</option>
              <option value="2025-06">June 2025</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowPayrollModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <DollarSign className="w-4 h-4" />
            <span>Generate Payroll</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {[
            { id: 'payroll', label: 'Payroll', icon: DollarSign },
            { id: 'attendance', label: 'Attendance', icon: Clock },
            { id: 'leaves', label: 'Leave Management', icon: Calendar },
            { id: 'settings', label: 'Payroll Settings', icon: Settings }
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

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* Payroll Summary */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Payroll Summary - {selectedMonth.split('-')[0]} {new Date(selectedMonth).toLocaleString('default', { month: 'long' })}
              </h3>
              <div className="flex space-x-2">
                <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Export Payroll</span>
                </button>
                <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email All Payslips</span>
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  ${totalPayrollAmount.toLocaleString()}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Payroll
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {payrollData.length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Staff Members
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {payrollData.filter(p => p.paymentStatus === 'paid').length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Paid
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {payrollData.filter(p => p.paymentStatus === 'pending').length}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pending
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder="Search staff by name..."
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
                <option value="all">All Roles</option>
                <option value="Chef">Chef</option>
                <option value="Waiter">Waiter</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>

            {/* Payroll Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Staff</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Type</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Base Salary</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Allowances</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Deductions</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Overtime</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Bonus</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Total</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayroll.map((payroll) => {
                    const totalAllowances = payroll.allowances.reduce((sum, a) => sum + a.amount, 0);
                    const totalDeductions = payroll.deductions.reduce((sum, d) => sum + d.amount, 0);
                    const overtimeAmount = payroll.overtimeHours * payroll.overtimeRate;
                    
                    return (
                      <tr key={payroll.id} className={`border-b ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <div>
                            <div className="font-medium">{payroll.staffName}</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {payroll.role}
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 px-4 capitalize ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {payroll.salaryType}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          ${payroll.baseSalary.toLocaleString()}
                          {payroll.salaryType === 'hourly' && <span className="text-sm">/hr</span>}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          ${totalAllowances}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          ${totalDeductions}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {payroll.overtimeHours}h (${overtimeAmount})
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          ${payroll.bonus}
                        </td>
                        <td className={`py-3 px-4 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${payroll.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payroll.paymentStatus === 'paid' ? 'bg-success-100 text-success-800' :
                            payroll.paymentStatus === 'processing' ? 'bg-warning-100 text-warning-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {payroll.paymentStatus.charAt(0).toUpperCase() + payroll.paymentStatus.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => generatePayslip(payroll.id)}
                              className={`p-1 rounded ${
                                theme === 'dark' 
                                  ? 'hover:bg-gray-600 text-gray-300' 
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                              title="View Payslip"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedStaffId(payroll.staffId);
                                // Implementation for editing payroll
                              }}
                              className={`p-1 rounded ${
                                theme === 'dark' 
                                  ? 'hover:bg-gray-600 text-gray-300' 
                                  : 'hover:bg-gray-100 text-gray-600'
                              }`}
                              title="Edit Payroll"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {payroll.paymentStatus === 'pending' && (
                              <button
                                onClick={() => markAsPaid(payroll.id)}
                                className="p-1 rounded bg-success-500 hover:bg-success-600 text-white"
                                title="Mark as Paid"
                              >
                                <DollarSign className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Daily Attendance
              </h3>
              <div className="flex space-x-2">
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className={`px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                />
                <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Mark Attendance</span>
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Staff</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Date</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Check In</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Check Out</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Hours</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((attendance) => {
                    const staffMember = staff.find(s => s.id === attendance.staffId);
                    
                    return (
                      <tr key={attendance.id} className={`border-b ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <div>
                            <div className="font-medium">{staffMember?.name || 'Unknown Staff'}</div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {staffMember?.role}
                            </div>
                          </div>
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {attendance.date.toLocaleDateString()}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {attendance.status === 'present' ? attendance.checkIn.toLocaleTimeString() : '-'}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {attendance.checkOut ? attendance.checkOut.toLocaleTimeString() : '-'}
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {attendance.totalHours || '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            attendance.status === 'present' ? 'bg-success-100 text-success-800' :
                            attendance.status === 'absent' ? 'bg-error-100 text-error-800' :
                            attendance.status === 'leave' ? 'bg-warning-100 text-warning-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
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
                              <Trash2 className="w-4 h-4" />
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

          {/* Attendance Summary */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Monthly Attendance Summary
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <tr>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Staff</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Present</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Absent</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Leave</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Total Hours</th>
                    <th className={`text-left py-3 px-4 font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((staffMember) => {
                    const summary = getAttendanceSummary(staffMember.id);
                    const totalDays = summary.present + summary.absent + summary.leave;
                    const attendancePercentage = totalDays ? (summary.present / totalDays) * 100 : 0;
                    
                    return (
                      <tr key={staffMember.id} className={`border-b ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          <div className="font-medium">{staffMember.name}</div>
                          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {staffMember.role}
                          </div>
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {summary.present} days
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {summary.absent} days
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {summary.leave} days
                        </td>
                        <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {summary.totalWorkHours.toFixed(2)}h
                        </td>
                        <td className={`py-3 px-4 ${
                          attendancePercentage >= 90 ? 'text-success-600' :
                          attendancePercentage >= 75 ? 'text-warning-600' :
                          'text-error-600'
                        }`}>
                          {attendancePercentage.toFixed(0)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Generate Payroll Modal */}
      {showPayrollModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-3xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Generate Monthly Payroll
              </h3>
              <button 
                onClick={() => setShowPayrollModal(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Month and Year
                  </label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
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
                    Calculate For
                  </label>
                  <select
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  >
                    <option value="all">All Staff</option>
                    <option value="active">Active Staff Only</option>
                    <option value="selected">Selected Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payroll Calculation Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      defaultChecked
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Include Overtime</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      defaultChecked
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Include Allowances</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      defaultChecked
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Apply Attendance Deduction</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPayrollModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log('Generating payroll for', selectedMonth);
                    setShowPayrollModal(false);
                  }}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Generate Payroll
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslip Modal */}
      {showPayslipModal && selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Payslip - {selectedPayroll.month} {selectedPayroll.year}
              </h3>
              <button 
                onClick={() => setShowPayslipModal(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Bella Italia Restaurant
                </h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  123 Main Street, Downtown, City 12345
                </p>
                <div className={`mt-2 inline-block px-4 py-1 rounded-full text-sm font-medium ${
                  theme === 'dark' ? 'bg-primary-200 text-primary-800' : 'bg-primary-100 text-primary-800'
                }`}>
                  Payslip for {selectedPayroll.month} {selectedPayroll.year}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className={`text-sm font-semibold mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Employee Details
                </h4>
                <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {selectedPayroll.staffName}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedPayroll.role}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Employee ID: EMP-{selectedPayroll.staffId}
                </p>
              </div>
              
              <div>
                <h4 className={`text-sm font-semibold mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Payment Details
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Payment Date: {selectedPayroll.paymentDate ? selectedPayroll.paymentDate.toLocaleDateString() : 'Pending'}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Payment Method: {selectedPayroll.paymentMethod || 'Not specified'}
                </p>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Payment Status: 
                  <span className={`ml-1 ${
                    selectedPayroll.paymentStatus === 'paid' ? 'text-success-600' :
                    selectedPayroll.paymentStatus === 'processing' ? 'text-warning-600' :
                    'text-error-600'
                  }`}>
                    {selectedPayroll.paymentStatus.charAt(0).toUpperCase() + selectedPayroll.paymentStatus.slice(1)}
                  </span>
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-lg mb-6 ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Earnings
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Base Salary
                      </span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${selectedPayroll.baseSalary}
                      </span>
                    </div>
                    {selectedPayroll.allowances.map((allowance, index) => (
                      <div key={index} className="flex justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {allowance.type.charAt(0).toUpperCase() + allowance.type.slice(1)} Allowance
                        </span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${allowance.amount}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Overtime ({selectedPayroll.overtimeHours} hours)
                      </span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${selectedPayroll.overtimeHours * selectedPayroll.overtimeRate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Bonus
                      </span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        ${selectedPayroll.bonus}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-semibold mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Deductions
                  </h4>
                  <div className="space-y-1">
                    {selectedPayroll.deductions.map((deduction, index) => (
                      <div key={index} className="flex justify-between">
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {deduction.type.charAt(0).toUpperCase() + deduction.type.slice(1)}
                        </span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ${deduction.amount}
                        </span>
                      </div>
                    ))}
                    {selectedPayroll.deductions.length === 0 && (
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        No deductions applied
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-600 dark:border-gray-500">
                <div className="flex justify-between">
                  <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Net Salary
                  </span>
                  <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ${selectedPayroll.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={downloadPayslip}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download Payslip</span>
              </button>
              
              <button
                onClick={emailPayslip}
                className="flex-1 bg-secondary-500 hover:bg-secondary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                <span>Email Payslip</span>
              </button>
              
              <button
                onClick={() => setShowPayslipModal(false)}
                className={`py-2 px-4 rounded-lg border transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                    : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;