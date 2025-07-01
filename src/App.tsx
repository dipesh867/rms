import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { AppProvider } from './contexts/AppContext';
import { InventoryProvider } from './hooks/useInventory';
import { MenuProvider } from './hooks/useMenu';
import { TableProvider } from './hooks/useTables';
import { POSProvider } from './hooks/usePOS';
import LoginPage from './pages/LoginPage';
import AdminLayout from './components/Layouts/AdminLayout';
import OwnerLayout from './components/Layouts/OwnerLayout';
import ManagerLayout from './components/Layouts/ManagerLayout';
import SuperUserSignUp from './pages/SuperUserSignUp';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import RegisterRestaurantPage from './pages/RegisterRestaurantPage';
import CreateManagerPage from './pages/CreateManagerPage';

function App() {
  return (
    <Router basename="/rms">
      <AppProvider>
        <AuthProvider>
          <InventoryProvider>
            <MenuProvider>
              <TableProvider>
                <POSProvider>
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 5000,
                      style: {
                        background: '#333',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        style: {
                          background: '#10B981',
                          color: '#fff',
                        },
                      },
                      error: {
                        duration: 3000,
                        style: {
                          background: '#EF4444',
                          color: '#fff',
                        },
                      }
                    }}
                  />
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/super-admin-signup" element={<SuperUserSignUp />} />
                    <Route path="/admin/*" element={<AdminLayout />} />
                    <Route path="/owner/*" element={<OwnerLayout />} />
                    <Route path="/manager/*" element={<ManagerLayout />} />
                    <Route 
                      path="/register-restaurant" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <RegisterRestaurantPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/create-manager" 
                      element={
                        <ProtectedRoute allowedRoles={['owner']}>
                          <CreateManagerPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </POSProvider>
              </TableProvider>
            </MenuProvider>
          </InventoryProvider>
        </AuthProvider>
      </AppProvider>
    </Router>
  );
}

export default App;