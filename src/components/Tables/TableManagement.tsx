import React, { useState } from 'react';
import { Users, Clock, CheckCircle, AlertCircle, MapPin, QrCode, Edit, Eye, MoreVertical, Plus, Filter, Search, Trash2, CarFront as ChairFront, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Table, Chair } from '../../types';
import TableForm from './TableForm';

const TableManagement: React.FC = () => {
  const { theme, tables, updateTableStatus, updateChairStatus, orders, addTable, updateTable, deleteTable } = useApp();
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'layout'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showTableDetails, setShowTableDetails] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const sections = ['All', ...Array.from(new Set(tables.map(table => table.section)))];

  const filteredTables = tables.filter(table => {
    const matchesSection = selectedSection === 'All' || table.section === selectedSection;
    const matchesSearch = table.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         table.section.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'occupied':
        return 'bg-error-100 text-error-800 border-error-200';
      case 'reserved':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'cleaning':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4" />;
      case 'occupied':
        return <Users className="w-4 h-4" />;
      case 'reserved':
        return <Clock className="w-4 h-4" />;
      case 'cleaning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTableOrder = (tableId: string) => {
    return orders.find(order => order.tableId === tableId && order.status === 'active');
  };

  const getChairOrders = (tableId: string) => {
    return orders.filter(order => 
      order.tableId === tableId && 
      order.chairId && 
      order.status === 'active'
    );
  };

  const handleTableSave = (tableData: Table) => {
    if (tableData.id && tables.some(t => t.id === tableData.id)) {
      // Update existing table
      updateTable(tableData.id, tableData);
    } else {
      // Add new table
      addTable(tableData);
    }
    setShowAddModal(false);
    setSelectedTable(null);
  };

  const handleDeleteTable = () => {
    if (selectedTable) {
      deleteTable(selectedTable.id);
      setShowConfirmDelete(false);
      setSelectedTable(null);
    }
  };

  const handleChangeChairStatus = (tableId: string, chairId: string, status: Chair['status']) => {
    updateChairStatus(tableId, chairId, status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Table Management
          </h1>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage tables, chairs, and reservations
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            />
          </div>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
          >
            {sections.map(section => (
              <option key={section} value={section}>
                {section}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
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
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('layout')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === 'layout'
                  ? 'bg-primary-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Layout
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedTable(null);
              setShowAddModal(true);
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Available', count: tables.filter(t => t.status === 'available').length, color: 'success' },
          { label: 'Occupied', count: tables.filter(t => t.status === 'occupied').length, color: 'error' },
          { label: 'Reserved', count: tables.filter(t => t.status === 'reserved').length, color: 'warning' },
          { label: 'Cleaning', count: tables.filter(t => t.status === 'cleaning').length, color: 'gray' }
        ].map((stat) => (
          <div key={stat.label} className={`p-4 rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-sm`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                stat.color === 'success' ? 'text-success-600' :
                stat.color === 'error' ? 'text-error-600' :
                stat.color === 'warning' ? 'text-warning-600' :
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {stat.count}
              </div>
              <div className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTables.map((table) => {
            const chairOrders = getChairOrders(table.id);
            const occupiedChairs = table.chairs.filter(c => c.status === 'occupied').length;
            const totalChairs = table.chairs.length;
            
            return (
              <div
                key={table.id}
                className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      table.status === 'available' ? 'bg-success-100' :
                      table.status === 'occupied' ? 'bg-error-100' :
                      table.status === 'reserved' ? 'bg-warning-100' :
                      'bg-gray-100'
                    }`}>
                      <Users className={`w-6 h-6 ${
                        table.status === 'available' ? 'text-success-600' :
                        table.status === 'occupied' ? 'text-error-600' :
                        table.status === 'reserved' ? 'text-warning-600' :
                        'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Table {table.number}
                      </h3>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {table.capacity} seats
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => {
                        setSelectedTable(table);
                        setShowTableDetails(true);
                      }}
                      className={`p-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-700 text-gray-400' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedTable(table);
                        setShowAddModal(true);
                      }}
                      className={`p-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'hover:bg-gray-700 text-gray-400' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Status:
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(table.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(table.status)}
                        <span className="capitalize">{table.status}</span>
                      </div>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Section:
                    </span>
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {table.section}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Chair Occupancy:
                    </span>
                    <span className={`text-sm font-medium ${
                      occupiedChairs > 0 ? 'text-warning-600' : 'text-success-600'
                    }`}>
                      {occupiedChairs}/{totalChairs} Chairs
                    </span>
                  </div>

                  {chairOrders.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Active Orders:
                      </span>
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {chairOrders.length} Orders
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {table.chairs.map((chair, index) => (
                      <div 
                        key={chair.id} 
                        className={`flex-1 min-w-[55px] p-2 rounded text-center text-xs font-medium ${
                          chair.status === 'available' ? 'bg-success-100 text-success-800' :
                          chair.status === 'occupied' ? 'bg-error-100 text-error-800' :
                          chair.status === 'reserved' ? 'bg-warning-100 text-warning-800' :
                          'bg-gray-100 text-gray-800'
                        } cursor-pointer transition-all duration-200 hover:opacity-80`}
                        title={`Chair ${chair.number}: ${chair.status}`}
                        onClick={() => handleChangeChairStatus(
                          table.id, 
                          chair.id, 
                          chair.status === 'available' ? 'occupied' : 'available'
                        )}
                      >
                        <ChairFront className="w-4 h-4 mx-auto mb-1" />
                        <span className="block truncate">{chair.number}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'list' ? (
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
                    Table
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Section
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Capacity
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Status
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Chairs
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Current Orders
                  </th>
                  <th className={`text-left py-4 px-6 font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTables.map((table) => {
                  const chairOrders = getChairOrders(table.id);
                  const occupiedChairs = table.chairs.filter(c => c.status === 'occupied').length;
                  
                  return (
                    <tr key={table.id} className={`border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200`}>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            table.status === 'available' ? 'bg-success-100' :
                            table.status === 'occupied' ? 'bg-error-100' :
                            table.status === 'reserved' ? 'bg-warning-100' :
                            'bg-gray-100'
                          }`}>
                            <Users className={`w-4 h-4 ${
                              table.status === 'available' ? 'text-success-600' :
                              table.status === 'occupied' ? 'text-error-600' :
                              table.status === 'reserved' ? 'text-warning-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <span className="font-medium">Table {table.number}</span>
                        </div>
                      </td>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{table.section}</span>
                        </div>
                      </td>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {table.capacity} seats
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(table.status)}`}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(table.status)}
                            <span className="capitalize">{table.status}</span>
                          </div>
                        </span>
                      </td>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <div className="flex items-center">
                          <span className={`mr-2 ${occupiedChairs > 0 ? 'text-warning-600' : 'text-success-600'}`}>
                            {occupiedChairs}/{table.chairs.length}
                          </span>
                          <div className="flex gap-1">
                            {table.chairs.map((chair, i) => (
                              <div 
                                key={i} 
                                title={`Chair ${chair.number}: ${chair.status}`}
                                className={`w-4 h-4 rounded-full ${
                                  chair.status === 'available' ? 'bg-success-500' :
                                  chair.status === 'occupied' ? 'bg-error-500' :
                                  chair.status === 'reserved' ? 'bg-warning-500' :
                                  'bg-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className={`py-4 px-6 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {chairOrders.length > 0 ? (
                          <div>
                            <div className="font-medium">{chairOrders.length} Orders</div>
                            <div className="text-sm text-gray-500">
                              ${chairOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)} Total
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setSelectedTable(table);
                              setShowTableDetails(true);
                            }}
                            className={`p-1 rounded ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedTable(table);
                              setShowAddModal(true);
                            }}
                            className={`p-1 rounded ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-gray-300' 
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedTable(table);
                              setShowConfirmDelete(true);
                            }}
                            className={`p-1 rounded ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-600 text-error-400' 
                                : 'hover:bg-gray-100 text-error-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button className={`p-1 rounded ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-600 text-gray-300' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}>
                            <QrCode className="w-4 h-4" />
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
      ) : (
        <div className={`p-6 rounded-xl ${
          theme === 'dark' 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-white border border-gray-200'
        } shadow-lg h-[600px] relative`}>
          <div className="absolute inset-0 p-6 overflow-auto">
            {/* Floor Plan Layout */}
            {filteredTables.map(table => {
              const occupiedChairs = table.chairs.filter(c => c.status === 'occupied').length;
              
              // Generate random positions for demo purposes - in a real app these would be stored
              const posX = (parseInt(table.id) * 175) % 800 + 100;
              const posY = (parseInt(table.id) * 120) % 500 + 50;

              return (
                <div
                  key={table.id}
                  style={{ 
                    left: `${posX}px`,
                    top: `${posY}px`,
                    width: table.shape === 'circle' ? '120px' : '140px',
                    height: table.shape === 'circle' ? '120px' : table.capacity <= 4 ? '100px' : '180px',
                    borderRadius: table.shape === 'circle' ? '50%' : '8px'
                  }}
                  className={`absolute flex flex-col items-center justify-center border-2 cursor-pointer transition-transform duration-200 hover:scale-105 ${
                    table.status === 'available' ? 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-700' :
                    table.status === 'occupied' ? 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-700' :
                    table.status === 'reserved' ? 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-700' :
                    'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedTable(table);
                    setShowTableDetails(true);
                  }}
                >
                  <div className={`text-lg font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Table {table.number}
                  </div>
                  <div className="text-xs mt-1 mb-2 text-gray-500">
                    {occupiedChairs}/{table.capacity} occupied
                  </div>

                  {/* Visualize chairs - simpler for visual representation */}
                  {table.shape !== 'circle' && (
                    <div className="flex flex-wrap justify-center gap-1 max-w-[100px]">
                      {table.chairs.map((chair, i) => (
                        <div 
                          key={i}
                          className={`w-5 h-5 rounded-full ${
                            chair.status === 'available' ? 'bg-success-500' :
                            chair.status === 'occupied' ? 'bg-error-500' :
                            chair.status === 'reserved' ? 'bg-warning-500' :
                            'bg-gray-500'
                          }`}
                          title={`Chair ${chair.number}: ${chair.status}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="absolute bottom-4 right-4 opacity-50 text-sm text-gray-500">
              Drag & drop functionality would be implemented in production
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className={`relative w-full max-w-2xl rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 shadow-xl`}>
            <h2 className={`text-xl font-semibold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedTable ? 'Edit Table' : 'Add New Table'}
            </h2>
            
            <TableForm
              initialData={selectedTable || undefined}
              onSave={handleTableSave}
              onCancel={() => {
                setShowAddModal(false);
                setSelectedTable(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Table Details Modal */}
      {showTableDetails && selectedTable && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className={`relative w-full max-w-3xl rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 shadow-xl`}>
            <div className="flex justify-between items-start mb-6">
              <h2 className={`text-xl font-semibold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Table {selectedTable.number} Details
              </h2>
              <button 
                onClick={() => setShowTableDetails(false)}
                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-lg font-medium mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Table Information
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Section</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{selectedTable.section}</dd>
                  
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Capacity</dt>
                  <dd className="text-sm text-gray-900 dark:text-white">{selectedTable.capacity} seats</dd>
                  
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
                  <dd>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedTable.status === 'available' ? 'bg-success-100 text-success-800' :
                      selectedTable.status === 'occupied' ? 'bg-error-100 text-error-800' :
                      selectedTable.status === 'reserved' ? 'bg-warning-100 text-warning-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedTable.status}
                    </span>
                  </dd>
                  
                  <dt className="text-sm text-gray-500 dark:text-gray-400">Shape</dt>
                  <dd className="text-sm text-gray-900 dark:text-white capitalize">
                    {selectedTable.shape || 'Rectangle'}
                  </dd>
                </dl>

                <h3 className={`text-lg font-medium mt-6 mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Active Orders
                </h3>
                <div className={`rounded-lg border ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                } overflow-hidden`}>
                  {getChairOrders(selectedTable.id).length > 0 ? (
                    <table className="w-full">
                      <thead className={`${
                        theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600'
                      } text-xs`}>
                        <tr>
                          <th className="py-2 px-3 text-left">Chair</th>
                          <th className="py-2 px-3 text-left">Items</th>
                          <th className="py-2 px-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {getChairOrders(selectedTable.id).map(order => (
                          <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                            <td className="py-2 px-3 text-sm">
                              {order.chairId ? (
                                <div className="flex items-center">
                                  <ChairFront className="w-4 h-4 mr-1 text-gray-400" />
                                  <span>
                                    {selectedTable.chairs.find(c => c.id === order.chairId)?.number || 'Unknown'}
                                  </span>
                                </div>
                              ) : 'Table Order'}
                            </td>
                            <td className="py-2 px-3 text-sm">
                              {order.items.length} items
                            </td>
                            <td className="py-2 px-3 text-sm font-medium text-right">
                              ${order.total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="py-4 px-3 text-sm text-center text-gray-500 dark:text-gray-400">
                      No active orders for this table
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className={`text-lg font-medium mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Chair Management
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedTable.chairs.map((chair) => (
                    <div
                      key={chair.id}
                      className={`p-3 rounded-lg border ${
                        chair.status === 'available' ? 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-700' :
                        chair.status === 'occupied' ? 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-700' :
                        chair.status === 'reserved' ? 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-700' :
                        'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                      } hover:shadow-md transition-shadow cursor-pointer`}
                      onClick={() => handleChangeChairStatus(
                        selectedTable.id,
                        chair.id,
                        chair.status === 'available' ? 'occupied' : 
                        chair.status === 'occupied' ? 'available' : 
                        chair.status === 'reserved' ? 'occupied' : 'available'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <ChairFront className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">Chair {chair.number}</span>
                        </div>
                        <span className={`w-3 h-3 rounded-full ${
                          chair.status === 'available' ? 'bg-success-500' :
                          chair.status === 'occupied' ? 'bg-error-500' :
                          chair.status === 'reserved' ? 'bg-warning-500' :
                          'bg-gray-500'
                        }`}></span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs capitalize ${
                          chair.status === 'available' ? 'text-success-700 dark:text-success-400' :
                          chair.status === 'occupied' ? 'text-error-700 dark:text-error-400' :
                          chair.status === 'reserved' ? 'text-warning-700 dark:text-warning-400' :
                          'text-gray-500 dark:text-gray-400'
                        }`}>
                          {chair.status}
                        </span>
                        {chair.currentOrder && (
                          <span className="text-xs text-primary-600">
                            Has order
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                    Quick Action Guide
                  </h4>
                  <ul className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start">
                      <span className="w-3 h-3 mt-1 mr-2 rounded-full bg-success-500"></span>
                      <span>Click on a chair to change its status. Available → Occupied → Available</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-3 h-3 mt-1 mr-2 rounded-full bg-error-500"></span>
                      <span>Occupied chairs have active orders attached to them</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-3 h-3 mt-1 mr-2 rounded-full bg-warning-500"></span>
                      <span>Reserved chairs are holding spots for future customers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowTableDetails(false);
                  setSelectedTable(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowTableDetails(false);
                  setShowAddModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600"
              >
                Edit Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && selectedTable && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className={`relative w-full max-w-md rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } p-6 shadow-xl`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Confirm Deletion
            </h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Are you sure you want to delete Table {selectedTable.number}? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteTable}
                className="px-4 py-2 rounded-lg bg-error-500 text-white hover:bg-error-600"
              >
                Delete Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;