import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  Clock,
  Printer,
  Mail,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Star,
  Utensils
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'sales' | 'inventory' | 'staff' | 'customer';
}

const ReportGenerator: React.FC = () => {
  const { theme } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const periods = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'last_week', label: 'Last Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const reportTypes: ReportType[] = [
    {
      id: 'sales_summary',
      name: 'Sales Summary',
      description: 'Overview of all sales, revenue, and taxes',
      icon: DollarSign,
      category: 'sales'
    },
    {
      id: 'item_performance',
      name: 'Item Performance',
      description: 'Best and worst selling menu items',
      icon: BarChart3,
      category: 'sales'
    },
    {
      id: 'hourly_sales',
      name: 'Hourly Sales',
      description: 'Sales breakdown by hour of day',
      icon: Clock,
      category: 'sales'
    },
    {
      id: 'payment_methods',
      name: 'Payment Methods',
      description: 'Analysis of payment methods used',
      icon: PieChart,
      category: 'sales'
    },
    {
      id: 'inventory_usage',
      name: 'Inventory Usage',
      description: 'Consumption of inventory items',
      icon: Package,
      category: 'inventory'
    },
    {
      id: 'low_stock',
      name: 'Low Stock Report',
      description: 'Items that need restocking',
      icon: Package,
      category: 'inventory'
    },
    {
      id: 'staff_performance',
      name: 'Staff Performance',
      description: 'Staff productivity and sales',
      icon: Users,
      category: 'staff'
    },
    {
      id: 'staff_hours',
      name: 'Staff Hours',
      description: 'Hours worked by staff members',
      icon: Clock,
      category: 'staff'
    },
    {
      id: 'customer_retention',
      name: 'Customer Retention',
      description: 'Repeat customer analysis',
      icon: Users,
      category: 'customer'
    },
    {
      id: 'customer_feedback',
      name: 'Customer Feedback',
      description: 'Ratings and reviews summary',
      icon: Star,
      category: 'customer'
    }
  ];

  const [generatedReports] = useState([
    {
      id: 'report_1',
      name: 'Monthly Sales Summary - April 2025',
      type: 'sales_summary',
      date: new Date('2025-04-30'),
      format: 'PDF',
      size: '1.2 MB'
    },
    {
      id: 'report_2',
      name: 'Inventory Usage - Q1 2025',
      type: 'inventory_usage',
      date: new Date('2025-03-31'),
      format: 'Excel',
      size: '3.5 MB'
    },
    {
      id: 'report_3',
      name: 'Staff Performance - March 2025',
      type: 'staff_performance',
      date: new Date('2025-03-31'),
      format: 'PDF',
      size: '0.8 MB'
    }
  ]);

  const filteredReportTypes = reportTypes.filter(report => 
    selectedCategory === 'all' || report.category === selectedCategory
  );

  const getReportTypeIcon = (typeId: string) => {
    const reportType = reportTypes.find(r => r.id === typeId);
    if (!reportType) return FileText;
    return reportType.icon;
  };

  const generateReport = () => {
    if (!selectedReportType) return;
    
    console.log(`Generating report: ${selectedReportType} for period: ${selectedPeriod}`);
    setShowGenerateModal(false);
    // Implementation for report generation
  };

  const downloadReport = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`);
    // Implementation for report download
  };

  const emailReport = (reportId: string) => {
    console.log(`Emailing report: ${reportId}`);
    // Implementation for report email
  };

  const printReport = (reportId: string) => {
    console.log(`Printing report: ${reportId}`);
    // Implementation for report printing
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Reports & Analytics
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate and manage detailed reports for your restaurant
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Report Categories */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setSelectedCategory('sales')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedCategory === 'sales'
                ? 'bg-primary-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Sales</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedCategory('inventory')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedCategory === 'inventory'
                ? 'bg-primary-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Inventory</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedCategory('staff')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedCategory === 'staff'
                ? 'bg-primary-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Staff</span>
            </div>
          </button>
          <button
            onClick={() => setSelectedCategory('customer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              selectedCategory === 'customer'
                ? 'bg-primary-500 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </div>
          </button>
        </div>
      </div>

      {/* Available Reports */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Available Reports
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div key={report.id} className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                theme === 'dark'
                  ? 'border-gray-700 hover:border-primary-500 bg-gray-700'
                  : 'border-gray-200 hover:border-primary-500 bg-gray-50'
              }`}
              onClick={() => {
                setSelectedReportType(report.id);
                setShowGenerateModal(true);
              }}>
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    report.category === 'sales' ? 'bg-blue-100 text-blue-600' :
                    report.category === 'inventory' ? 'bg-green-100 text-green-600' :
                    report.category === 'staff' ? 'bg-purple-100 text-purple-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {report.name}
                  </h4>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {report.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <h3 className={`text-lg font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Recent Reports
        </h3>
        
        <div className="space-y-4">
          {generatedReports.map((report) => {
            const ReportIcon = getReportTypeIcon(report.type);
            const isExpanded = expandedReport === report.id;
            
            return (
              <div key={report.id} className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      report.type.startsWith('sales') ? 'bg-blue-100 text-blue-600' :
                      report.type.startsWith('inventory') ? 'bg-green-100 text-green-600' :
                      report.type.startsWith('staff') ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <ReportIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {report.name}
                      </h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Generated on {report.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => downloadReport(report.id)}
                      className={`p-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-600 text-gray-300' 
                          : 'hover:bg-gray-200 text-gray-600'
                      } transition-colors duration-200`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                      className={`p-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-600 text-gray-300' 
                          : 'hover:bg-gray-200 text-gray-600'
                      } transition-colors duration-200`}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Format:
                        </span>
                        <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {report.format}
                        </span>
                      </div>
                      <div>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Size:
                        </span>
                        <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {report.size}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => downloadReport(report.id)}
                        className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => emailReport(report.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                          theme === 'dark'
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        } flex items-center justify-center space-x-2`}
                      >
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </button>
                      <button
                        onClick={() => printReport(report.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                          theme === 'dark'
                            ? 'bg-gray-600 hover:bg-gray-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                        } flex items-center justify-center space-x-2`}
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Generate Report
              </h3>
              <button 
                onClick={() => setShowGenerateModal(false)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Report Type
                </label>
                <select
                  value={selectedReportType || ''}
                  onChange={(e) => setSelectedReportType(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  <option value="">Select a report type</option>
                  {reportTypes.map(report => (
                    <option key={report.id} value={report.id}>
                      {report.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Time Period
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Start Date
                    </label>
                    <input
                      type="date"
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
                      End Date
                    </label>
                    <input
                      type="date"
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Format
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      defaultChecked
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>PDF</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="format"
                      value="excel"
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Excel</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>CSV</span>
                  </label>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={generateReport}
                  disabled={!selectedReportType}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;