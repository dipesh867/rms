import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthAPI } from '../../hooks/useAuthAPI';
import Sidebar from '../Layout/Sidebar';
import Header from '../Layout/Header';

// Owner Components
import OwnerDashboard from '../Dashboard/OwnerDashboard';
import POSTerminal from '../POS/POSTerminal';
import AdvancedPOSTerminal from '../POS/AdvancedPOSTerminal';
import TableManagement from '../Tables/TableManagement';
import QRManagement from '../QR/QRManagement';
import MenuBuilder from '../Menu/MenuBuilder';
import StaffManagement from '../Staff/StaffManagement';
import InventorySystem from '../Inventory/InventorySystem';
import VendorMicrosite from '../Vendor/VendorMicrosite';

const OwnerLayout: React.FC = () => {
  const { user } = useAuthAPI();
  const [activeSection, setActiveSection] = React.useState('dashboard');

  if (!user || user.role !== 'owner') {
    return <Navigate to="/login" replace />;
  }

  const getSectionTitle = (section: string) => {
    const titles: { [key: string]: string } = {
      dashboard: 'Dashboard',
      pos: 'POS Terminal',
      'advanced-pos': 'Advanced POS',
      orders: 'Order Management',
      tables: 'Table Management',
      menu: 'Menu Builder',
      customers: 'Customer Management',
      hotel: 'Hotel Management',
      inventory: 'Inventory Management',
      staff: 'Staff Management',
      'qr-management': 'QR Management',
      loyalty: 'Loyalty Program',
      expenses: 'Expense Management',
      settings: 'Settings',
    };
    return titles[section] || 'Dashboard';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <OwnerDashboard />;
      case 'pos':
        return <POSTerminal />;
      case 'advanced-pos':
        return <AdvancedPOSTerminal />;
      case 'tables':
        return <TableManagement />;
      case 'qr-management':
        return <QRManagement />;
      case 'menu':
        return <MenuBuilder />;
      case 'staff':
        return <StaffManagement />;
      case 'inventory':
        return <InventorySystem />;
      case 'vendor-website':
        return <VendorMicrosite />;
      case 'orders':
        return <div className="p-6"><h1 className="text-2xl font-bold">Order Management</h1><p>Coming soon...</p></div>;
      case 'customers':
        return <div className="p-6"><h1 className="text-2xl font-bold">Customer Management</h1><p>Coming soon...</p></div>;
      case 'hotel':
        return <div className="p-6"><h1 className="text-2xl font-bold">Hotel Management</h1><p>Coming soon...</p></div>;
      case 'analytics':
        return <div className="p-6"><h1 className="text-2xl font-bold">Business Analytics</h1><p>Coming soon...</p></div>;
      case 'billing':
        return <div className="p-6"><h1 className="text-2xl font-bold">Billing & Payments</h1><p>Coming soon...</p></div>;
      case 'loyalty':
        return <div className="p-6"><h1 className="text-2xl font-bold">Loyalty Program</h1><p>Coming soon...</p></div>;
      case 'expenses':
        return <div className="p-6"><h1 className="text-2xl font-bold">Expense Management</h1><p>Coming soon...</p></div>;
      case 'settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">Restaurant Settings</h1><p>Coming soon...</p></div>;
      default:
        return <OwnerDashboard />;
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
            <Route path="staff" element={<StaffManagement />} />
            <Route path="inventory" element={<InventorySystem />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;