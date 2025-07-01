import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import ManagerDashboard from './ManagerDashboard';
import OrderManagement from './OrderManagement';
import CustomerManagement from './CustomerManagement';
import RestaurantSettings from './RestaurantSettings';
import ReportGenerator from './ReportGenerator';
import TableManagement from '../Tables/TableManagement';
import InventorySystem from '../Inventory/InventorySystem';
import StaffManagement from '../Staff/StaffManagement';
import POSTerminal from '../POS/POSTerminal';
import AdvancedPOSTerminal from '../POS/AdvancedPOSTerminal';
import MenuBuilder from '../Menu/MenuBuilder';
import QRManagement from '../QR/QRManagement';
import PayrollManagement from './PayrollManagement';
import POSSettings from '../POS/POSSettings';
import MenuIngredientMapper from '../Menu/MenuIngredientMapper';
import SalesReport from '../Reports/SalesReport';
import InventoryReport from '../Reports/InventoryReport';
import StaffReport from '../Reports/StaffReport';

interface ManagerPortalProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const ManagerPortal: React.FC<ManagerPortalProps> = ({ activeSection, onSectionChange }) => {
  const { theme } = useApp();

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <ManagerDashboard />;
      case 'pos':
        return <POSTerminal />;
      case 'advanced-pos':
        return <AdvancedPOSTerminal />;
      case 'orders':
        return <OrderManagement />;
      case 'tables':
        return <TableManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'inventory':
        return <InventorySystem />;
      case 'analytics':
        return <SalesReport />;
      case 'reports':
        return <ReportGenerator />;
      case 'customers':
        return <CustomerManagement />;
      case 'settings':
        return <RestaurantSettings />;
      case 'menu':
        return <MenuBuilder />;
      case 'qr-management':
        return <QRManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'pos-settings':
        return <POSSettings />;
      case 'menu-ingredients':
        return <MenuIngredientMapper />;
      case 'sales-report':
        return <SalesReport />;
      case 'inventory-report':
        return <InventoryReport />;
      case 'staff-report':
        return <StaffReport />;
      default:
        return <ManagerDashboard />;
    }
  };

  return (
    <div className="flex-1">
      {renderContent()}
    </div>
  );
};

export default ManagerPortal;