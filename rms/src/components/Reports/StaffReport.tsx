import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Download, 
  Printer,
  DollarSign,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserX,
  UserMinus,
  Filter,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface ReportFilters {
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  department: string;
  role: string;
}

interface StaffSummary {
  totalStaff: number;
  activeStaff: number;
  onLeaveStaff: number;
  averagePerformance: number;
  attendanceRate: number;
  totalWorkHours: number;
  totalSalary: number;
}

interface StaffAttendance {
  date: string;
  present: number;
  absent: number;
  leave: number;
}

interface StaffPerformance {
  name: string;
  department: string;
  role: string;
  attendanceRate: number;
  performanceRating: number;
  ordersHandled: number;
  customerRating: number;
  hourlyEfficiency: number;
}

const StaffReport: React.FC = () => {
  const { theme } = useApp();
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'month',
    department: 'all',
    role: 'all'
  });

  // Mock data
  const staffSummary: StaffSummary = {
    totalStaff: 24,
    activeStaff: 20,
    onLeaveStaff: 4,
    averagePerformance: 4.2,
    attendanceRate: 92.5,
    totalWorkHours: 3240,
    totalSalary: 42500
  };

  const staffAttendance: StaffAttendance[] = [
    { date: '2025-04-01', present: 22, absent: 1, leave: 1 },
    { date: '2025-04-02', present: 21, absent: 2, leave: 1 },
    { date: '2025-04-03', present: 20, absent: 3, leave: 1 },
    { date: '2025-04-04', present: 23, absent: 0, leave: 1 },
    { date: '2025-04-05', present: 19, absent: 4, leave: 1 },
    { date: '2025-04-06', present: 18, absent: 4, leave: 2 },
    { date: '2025-04-07', present: 20, absent: 2, leave: 2 }
  ];

  const staffPerformance: StaffPerformance[] = [
    { name: 'John Smith', department: 'Kitchen', role: 'Chef', attendanceRate: 98.5, performanceRating: 4.8, ordersHandled: 420, customerRating: 4.9, hourlyEfficiency: 15.2 },
    { name: 'Sarah Johnson', department: 'Service', role: 'Waiter', attendanceRate: 96.2, performanceRating: 4.7, ordersHandled: 350, customerRating: 4.8, hourlyEfficiency: 12.5 },
    { name: 'Mike Wilson', department: 'Kitchen', role: 'Sous Chef', attendanceRate: 95.0, performanceRating: 4.5, ordersHandled: 380, customerRating: 4.6, hourlyEfficiency: 14.3 },
    { name: 'Emma Davis', department: 'Service', role: 'Hostess', attendanceRate: 94.8, performanceRating: 4.4, ordersHandled: 280, customerRating: 4.7, hourlyEfficiency: 11.8 },
    { name: 'David Brown', department: 'Management', role: 'Shift Manager', attendanceRate: 97.5, performanceRating: 4.6, ordersHandled: 150, customerRating: 4.5, hourlyEfficiency: 16.2 }
  ];

  // Handle date range change
  const handleDateRangeChange = (range: ReportFilters['dateRange']) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  const downloadReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Downloading staff report in ${format} format`);
    // Implementation for downloading report
  };

  const printReport = () => {
    console.log('Printing staff report');
    // Implementation for printing report
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Staff Performance Report
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Analysis of staff attendance, performance, and productivity
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={filters.dateRange}
              onChange={(e) => handleDateRangeChange(e.target.value as any)}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div className="dropdown dropdown-end">
            <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <div className="dropdown-content">
              <button onClick={() => downloadReport('pdf')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                PDF
              </button>
              <button onClick={() => downloadReport('excel')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                Excel
              </button>
              <button onClick={() => downloadReport('csv')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                CSV
              </button>
            </div>
          </div>
          
          <button
            onClick={printReport}
            className={`p-2 rounded-lg border transition-colors duration-200 ${
              theme === 'dark'
                ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                : 'border-gray-200 hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
              <span>{staffSummary.activeStaff}/{staffSummary.totalStaff}</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {staffSummary.totalStaff}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Staff
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-success-600" />
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+2.5%</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {staffSummary.attendanceRate}%
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Attendance Rate
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-warning-600" />
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>+0.3</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {staffSummary.averagePerformance}/5
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Avg. Performance
            </p>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center space-x-1 text-sm font-medium text-success-600">
              <Clock className="w-4 h-4" />
              <span>{staffSummary.totalWorkHours}h</span>
            </div>
          </div>
          <div>
            <h3 className={`text-2xl font-bold mb-1 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              ${staffSummary.totalSalary.toLocaleString()}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Total Payroll
            </p>
          </div>
        </div>
      </div>

      {/* Attendance Trend */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Attendance Trend
          </h3>
          <div className="flex space-x-2">
            <button className={`px-3 py-1 rounded-lg text-xs font-medium ${
              theme === 'dark' 
                ? 'bg-gray-600 text-white' 
                : 'bg-primary-500 text-white'
            }`}>
              Daily
            </button>
            <button className={`px-3 py-1 rounded-lg text-xs font-medium ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              Weekly
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={staffAttendance}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
              />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                  border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                }}
              />
              <Legend />
              <Bar dataKey="present" name="Present" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leave" name="Leave" fill="#F59E0B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff Performance */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Staff Performance
          </h3>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <select
                className={`pl-10 pr-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
              >
                <option value="all">All Departments</option>
                <option value="kitchen">Kitchen</option>
                <option value="service">Service</option>
                <option value="management">Management</option>
              </select>
            </div>
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
                }`}>Department</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Role</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Attendance</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Performance</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Orders Handled</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Customer Rating</th>
                <th className={`text-left py-3 px-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {staffPerformance
                .filter(staff => filters.department === 'all' || staff.department.toLowerCase() === filters.department)
                .map((staff, index) => (
                <tr key={index} className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <div className="font-medium">{staff.name}</div>
                  </td>
                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {staff.department}
                  </td>
                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {staff.role}
                  </td>
                  <td className={`py-3 px-4 font-medium ${
                    staff.attendanceRate >= 95 ? 'text-success-600' :
                    staff.attendanceRate >= 90 ? 'text-warning-600' :
                    'text-error-600'
                  }`}>
                    {staff.attendanceRate}%
                  </td>
                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{staff.performanceRating}</span>
                    </div>
                  </td>
                  <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {staff.ordersHandled}
                  </td>
                  <td className={`py-3 px-4 font-medium ${
                    staff.customerRating >= 4.5 ? 'text-success-600' :
                    staff.customerRating >= 4.0 ? 'text-warning-600' :
                    'text-error-600'
                  }`}>
                    {staff.customerRating}/5
                  </td>
                  <td className={`py-3 px-4 font-medium ${
                    staff.hourlyEfficiency >= 15 ? 'text-success-600' :
                    staff.hourlyEfficiency >= 12 ? 'text-warning-600' :
                    'text-error-600'
                  }`}>
                    {staff.hourlyEfficiency.toFixed(1)} units/h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button className={`text-sm font-medium text-primary-600 flex items-center space-x-1 ml-auto`}>
            <span>View Full Staff Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Average Performance by Department
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { department: 'Kitchen', performance: 4.5, efficiency: 15.8 },
                  { department: 'Service', performance: 4.6, efficiency: 12.3 },
                  { department: 'Management', performance: 4.8, efficiency: 16.2 },
                  { department: 'Cleaning', performance: 4.2, efficiency: 11.5 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="department"
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tick={{ fontSize: 12 }}
                  domain={[3, 5]}
                  label={{ value: 'Performance (1-5)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Efficiency (units/h)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' }, fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'performance') return [`${value} / 5`, 'Performance Rating'];
                    if (name === 'efficiency') return [`${value} units/h`, 'Efficiency'];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                  }}
                />
                <Bar yAxisId="left" dataKey="performance" name="Performance" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="efficiency" name="Efficiency" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Attendance Trend (Last 30 Days)
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={[
                  { day: '1', rate: 92 },
                  { day: '5', rate: 94 },
                  { day: '10', rate: 91 },
                  { day: '15', rate: 96 },
                  { day: '20', rate: 93 },
                  { day: '25', rate: 90 },
                  { day: '30', rate: 95 }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                <XAxis 
                  dataKey="day"
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Day of Month', position: 'insideBottom', offset: -5, fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                  tick={{ fontSize: 12 }}
                  domain={[85, 100]}
                  label={{ value: 'Attendance Rate (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
                />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, 'Attendance Rate']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    border: theme === 'dark' ? '1px solid #374151' : '1px solid #E5E7EB'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: '#F59E0B', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReport;