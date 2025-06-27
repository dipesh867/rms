import React, { useState } from 'react';
import { 
  QrCode, 
  Download, 
  Printer, 
  Eye, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Copy,
  ExternalLink,
  Palette,
  Upload,
  Grid,
  List,
  Search,
  Filter
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import QRCode from 'react-qr-code';

interface QRCodeData {
  id: string;
  name: string;
  type: 'table' | 'room' | 'event' | 'takeaway';
  tableId?: string;
  roomId?: string;
  url: string;
  customization: {
    logo?: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
  };
  createdAt: Date;
  lastUsed?: Date;
  scanCount: number;
  isActive: boolean;
}

const QRManagement: React.FC = () => {
  const { theme, tables, rooms } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [previewQR, setPreviewQR] = useState<QRCodeData | null>(null);

  // Mock QR codes data
  const [qrCodes, setQRCodes] = useState<QRCodeData[]>([
    {
      id: '1',
      name: 'Table A1 - Main Dining',
      type: 'table',
      tableId: '1',
      url: 'https://yourrestaurant.com/menu/table/A1',
      customization: {
        color: '#3B82F6',
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB'
      },
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      scanCount: 142,
      isActive: true
    },
    {
      id: '2',
      name: 'Table A2 - Main Dining',
      type: 'table',
      tableId: '2',
      url: 'https://yourrestaurant.com/menu/table/A2',
      customization: {
        color: '#10B981',
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB'
      },
      createdAt: new Date('2024-01-15'),
      lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000),
      scanCount: 89,
      isActive: true
    },
    {
      id: '3',
      name: 'Room 101 - Hotel Service',
      type: 'room',
      roomId: '1',
      url: 'https://yourhotel.com/room-service/101',
      customization: {
        color: '#8B5CF6',
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB'
      },
      createdAt: new Date('2024-01-20'),
      lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000),
      scanCount: 23,
      isActive: true
    }
  ]);

  const [newQR, setNewQR] = useState({
    name: '',
    type: 'table' as 'table' | 'room' | 'event' | 'takeaway',
    tableId: '',
    roomId: '',
    customUrl: '',
    customization: {
      color: '#3B82F6',
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E7EB'
    }
  });

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'table', label: 'Table QR' },
    { value: 'room', label: 'Room QR' },
    { value: 'event', label: 'Event QR' },
    { value: 'takeaway', label: 'Takeaway QR' }
  ];

  const filteredQRCodes = qrCodes.filter(qr => {
    const matchesSearch = qr.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || qr.type === selectedType;
    return matchesSearch && matchesType;
  });

  const generateQRCode = () => {
    let url = '';
    let name = newQR.name;

    switch (newQR.type) {
      case 'table':
        const table = tables.find(t => t.id === newQR.tableId);
        url = `https://yourrestaurant.com/menu/table/${table?.number || newQR.tableId}`;
        if (!name) name = `Table ${table?.number} - ${table?.section}`;
        break;
      case 'room':
        const room = rooms.find(r => r.id === newQR.roomId);
        url = `https://yourhotel.com/room-service/${room?.number || newQR.roomId}`;
        if (!name) name = `Room ${room?.number} - Hotel Service`;
        break;
      case 'event':
        url = newQR.customUrl || 'https://yourrestaurant.com/events';
        if (!name) name = 'Event QR Code';
        break;
      case 'takeaway':
        url = newQR.customUrl || 'https://yourrestaurant.com/takeaway';
        if (!name) name = 'Takeaway Menu';
        break;
    }

    const newQRCode: QRCodeData = {
      id: Date.now().toString(),
      name,
      type: newQR.type,
      tableId: newQR.tableId || undefined,
      roomId: newQR.roomId || undefined,
      url,
      customization: newQR.customization,
      createdAt: new Date(),
      scanCount: 0,
      isActive: true
    };

    setQRCodes(prev => [...prev, newQRCode]);
    setShowCreateModal(false);
    setNewQR({
      name: '',
      type: 'table',
      tableId: '',
      roomId: '',
      customUrl: '',
      customization: {
        color: '#3B82F6',
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB'
      }
    });
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // Show notification
  };

  const downloadQR = (qrData: QRCodeData) => {
    // Implementation for downloading QR code as image
    console.log('Downloading QR:', qrData.name);
  };

  const printQR = (qrData: QRCodeData) => {
    // Implementation for printing QR code
    console.log('Printing QR:', qrData.name);
  };

  const bulkGenerate = () => {
    // Generate QR codes for all tables or rooms
    const tablesToGenerate = tables.filter(table => 
      !qrCodes.some(qr => qr.tableId === table.id)
    );

    const newQRCodes = tablesToGenerate.map(table => ({
      id: `table-${table.id}-${Date.now()}`,
      name: `Table ${table.number} - ${table.section}`,
      type: 'table' as const,
      tableId: table.id,
      url: `https://yourrestaurant.com/menu/table/${table.number}`,
      customization: {
        color: '#3B82F6',
        backgroundColor: '#FFFFFF',
        borderColor: '#E5E7EB'
      },
      createdAt: new Date(),
      scanCount: 0,
      isActive: true
    }));

    setQRCodes(prev => [...prev, ...newQRCodes]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            QR Code Management
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Generate and manage QR codes for tables, rooms, and events
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={bulkGenerate}
            className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Grid className="w-4 h-4" />
            <span>Bulk Generate</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create QR Code</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {qrCodes.length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total QR Codes
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
              <Eye className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0)}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Scans
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
              <Settings className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {qrCodes.filter(qr => qr.isActive).length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Active QR Codes
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
              <Download className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {qrCodes.filter(qr => qr.scanCount > 0).length}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                QR Codes Used
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <input
                type="text"
                placeholder="Search QR codes..."
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

          <div className={`flex rounded-lg border ${
            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
          }`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Codes Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredQRCodes.map((qrData) => (
            <div key={qrData.id} className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg hover:shadow-xl transition-all duration-300`}>
              <div className="text-center mb-4">
                <div className="bg-white p-4 rounded-lg inline-block">
                  <QRCode
                    value={qrData.url}
                    size={120}
                    fgColor={qrData.customization.color}
                    bgColor={qrData.customization.backgroundColor}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {qrData.name}
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} capitalize`}>
                    {qrData.type} QR Code
                  </p>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Scans: {qrData.scanCount}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    qrData.isActive 
                      ? 'bg-success-100 text-success-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {qrData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewQR(qrData)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Eye className="w-4 h-4 mx-auto" />
                  </button>
                  
                  <button
                    onClick={() => downloadQR(qrData)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Download className="w-4 h-4 mx-auto" />
                  </button>
                  
                  <button
                    onClick={() => printQR(qrData)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Printer className="w-4 h-4 mx-auto" />
                  </button>
                  
                  <button
                    onClick={() => copyToClipboard(qrData.url)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Copy className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
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
                    QR Code
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Name
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Type
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Scans
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Status
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredQRCodes.map((qrData) => (
                  <tr key={qrData.id} className={`border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
                    <td className="py-4 px-6">
                      <div className="bg-white p-2 rounded inline-block">
                        <QRCode
                          value={qrData.url}
                          size={40}
                          fgColor={qrData.customization.color}
                          bgColor={qrData.customization.backgroundColor}
                        />
                      </div>
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <div>
                        <div className="font-medium">{qrData.name}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Created {qrData.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span className="capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                        {qrData.type}
                      </span>
                    </td>
                    <td className={`py-4 px-6 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {qrData.scanCount}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        qrData.isActive 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {qrData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setPreviewQR(qrData)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors duration-200`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadQR(qrData)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors duration-200`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(qrData.url)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors duration-200`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedQR(qrData)}
                          className={`p-2 rounded-lg ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          } transition-colors duration-200`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create QR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 max-h-screen overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create New QR Code
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
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
                    QR Code Name
                  </label>
                  <input
                    type="text"
                    value={newQR.name}
                    onChange={(e) => setNewQR(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter QR code name"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    QR Code Type
                  </label>
                  <select
                    value={newQR.type}
                    onChange={(e) => setNewQR(prev => ({ ...prev, type: e.target.value as any }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    <option value="table">Table QR</option>
                    <option value="room">Room QR</option>
                    <option value="event">Event QR</option>
                    <option value="takeaway">Takeaway QR</option>
                  </select>
                </div>
              </div>

              {newQR.type === 'table' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Table
                  </label>
                  <select
                    value={newQR.tableId}
                    onChange={(e) => setNewQR(prev => ({ ...prev, tableId: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    <option value="">Choose a table</option>
                    {tables.map(table => (
                      <option key={table.id} value={table.id}>
                        Table {table.number} - {table.section}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {newQR.type === 'room' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Select Room
                  </label>
                  <select
                    value={newQR.roomId}
                    onChange={(e) => setNewQR(prev => ({ ...prev, roomId: e.target.value }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  >
                    <option value="">Choose a room</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        Room {room.number} - {room.type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(newQR.type === 'event' || newQR.type === 'takeaway') && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Custom URL (optional)
                  </label>
                  <input
                    type="url"
                    value={newQR.customUrl}
                    onChange={(e) => setNewQR(prev => ({ ...prev, customUrl: e.target.value }))}
                    placeholder="https://yourrestaurant.com/custom-page"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  />
                </div>
              )}

              {/* QR Customization */}
              <div>
                <h4 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  QR Code Customization
                </h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      QR Color
                    </label>
                    <input
                      type="color"
                      value={newQR.customization.color}
                      onChange={(e) => setNewQR(prev => ({ 
                        ...prev, 
                        customization: { ...prev.customization, color: e.target.value }
                      }))}
                      className="w-full h-10 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Background
                    </label>
                    <input
                      type="color"
                      value={newQR.customization.backgroundColor}
                      onChange={(e) => setNewQR(prev => ({ 
                        ...prev, 
                        customization: { ...prev.customization, backgroundColor: e.target.value }
                      }))}
                      className="w-full h-10 rounded-lg border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Border Color
                    </label>
                    <input
                      type="color"
                      value={newQR.customization.borderColor}
                      onChange={(e) => setNewQR(prev => ({ 
                        ...prev, 
                        customization: { ...prev.customization, borderColor: e.target.value }
                      }))}
                      className="w-full h-10 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="text-center">
                <label className={`block text-sm font-medium mb-4 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Preview
                </label>
                <div className="bg-white p-4 rounded-lg inline-block border">
                  <QRCode
                    value={`https://yourrestaurant.com/preview`}
                    size={150}
                    fgColor={newQR.customization.color}
                    bgColor={newQR.customization.backgroundColor}
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border transition-colors duration-200 ${
                    theme === 'dark'
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={generateQRCode}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Generate QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-lg rounded-xl ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                QR Code Preview
              </h3>
              <button 
                onClick={() => setPreviewQR(null)}
                className={`p-2 rounded-lg ${
                  theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-white p-6 rounded-lg inline-block">
                <QRCode
                  value={previewQR.url}
                  size={200}
                  fgColor={previewQR.customization.color}
                  bgColor={previewQR.customization.backgroundColor}
                />
              </div>
              
              <div>
                <h4 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {previewQR.name}
                </h4>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {previewQR.url}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => downloadQR(previewQR)}
                  className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => printQR(previewQR)}
                  className={`py-2 px-4 rounded-lg border transition-colors duration-200 flex items-center justify-center space-x-2 ${
                    theme === 'dark'
                      ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRManagement;