import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';
import ManagerPortal from '../Manager/ManagerPortal';

const ManagerLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'manager') {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'owner') {
      return <Navigate to="/owner/dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  const getSectionTitle = (section: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      pos: 'POS Terminal',
      'advanced-pos': 'Advanced POS',
      'pos-settings': 'POS Settings',
      orders: 'Order Management',
      tables: 'Table Management',
      menu: 'Menu Builder',
      'menu-ingredients': 'Menu-Ingredient Mapper',
      customers: 'Customer Management',
      staff: 'Staff Management',
      inventory: 'Inventory',
      analytics: 'Analytics',
      reports: 'Reports',
      settings: 'Settings',
      payroll: 'Payroll Management',
      'sales-report': 'Sales Report',
      'inventory-report': 'Inventory Report',
      'staff-report': 'Staff Report'
    };
    return titles[section] || 'Dashboard';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title={getSectionTitle(activeSection)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Routes>
            <Route path="/*" element={<ManagerPortal activeSection={activeSection} onSectionChange={setActiveSection} />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ManagerLayout;