import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthAPI } from '../../hooks/useAuthAPI';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';

// Admin Components
import AdminDashboard from '../Dashboard/AdminDashboard';
import AdminAnalytics from '../Admin/Analytics';
import VendorManagement from '../Admin/VendorManagement';
import UserManagement from '../Admin/UserManagement';
import RegisterRestaurantPage from '../../pages/RegisterRestaurantPage';

const AdminLayout: React.FC = () => {
  const { user } = useAuthAPI();
  const [activeSection, setActiveSection] = React.useState('dashboard');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  const getSectionTitle = (section: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      vendors: 'Vendor Management',
      users: 'User Management',
      'global-inventory': 'Global Inventory',
      'system-settings': 'System Settings',
      security: 'Security & Compliance',
      notifications: 'Notifications',
      support: 'Support Center',
      marketplace: 'Marketplace',
      reports: 'Reports',
      billing: 'Billing',
    };
    return titles[section] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'analytics':
        return <AdminAnalytics />;
      case 'vendors':
        return <VendorManagement />;
      case 'users':
        return <UserManagement />;
      case 'register-restaurant':
        return <RegisterRestaurantPage />;
      case 'global-inventory':
        return <div className="p-6"><h1 className="text-2xl font-bold">Global Inventory Management</h1><p>Coming soon...</p></div>;
      case 'system-settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">System Settings</h1><p>Coming soon...</p></div>;
      case 'security':
        return <div className="p-6"><h1 className="text-2xl font-bold">Security & Compliance</h1><p>Coming soon...</p></div>;
      case 'notifications':
        return <div className="p-6"><h1 className="text-2xl font-bold">Notification Center</h1><p>Coming soon...</p></div>;
      case 'support':
        return <div className="p-6"><h1 className="text-2xl font-bold">Support Center</h1><p>Coming soon...</p></div>;
      case 'marketplace':
        return <div className="p-6"><h1 className="text-2xl font-bold">Marketplace Management</h1><p>Coming soon...</p></div>;
      case 'reports':
        return <div className="p-6"><h1 className="text-2xl font-bold">Advanced Reports</h1><p>Coming soon...</p></div>;
      case 'billing':
        return <div className="p-6"><h1 className="text-2xl font-bold">Billing Management</h1><p>Coming soon...</p></div>;
      default:
        return <AdminDashboard />;
    }
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
            <Route path="dashboard" element={renderContent()} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="vendors" element={<VendorManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="register-restaurant" element={<RegisterRestaurantPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;