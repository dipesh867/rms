import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './hooks/useAuth';
import { AuthAPIProvider } from './hooks/useAuthAPI';
import { AppProvider } from './contexts/AppContext';
import { InventoryProvider } from './hooks/useInventory';
import { InventoryAPIProvider } from './hooks/useInventoryAPI';
import { MenuProvider } from './hooks/useMenu';
import { TableProvider } from './hooks/useTables';
import { TablesAPIProvider } from './hooks/useTablesAPI';
import { POSProvider } from './hooks/usePOS';
import { POSAPIProvider } from './hooks/usePOSAPI';
import LoginPage from './pages/LoginPage';
import AdminLogin from './pages/auth/AdminLogin';
import OwnerLogin from './pages/auth/OwnerLogin';
import StaffLogin from './pages/auth/StaffLogin';
import LoginSelector from './components/Auth/LoginSelector';
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
      <ThemeProvider>
        <AppProvider>
        <AuthAPIProvider>
          <InventoryAPIProvider>
            <MenuProvider>
              <TablesAPIProvider>
                <POSAPIProvider>
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
                    {/* Login selector - main entry point */}
                    <Route path="/login" element={<LoginSelector />} />

                    {/* Legacy login route */}
                    <Route path="/legacy-login" element={<LoginPage />} />

                    {/* Role-specific login routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/owner/login" element={<OwnerLogin />} />
                    <Route path="/staff/login" element={<StaffLogin />} />

                    <Route path="/super-admin-signup" element={<SuperUserSignUp />} />
                    <Route path="/admin/*" element={<AdminLayout />} />
                    <Route path="/owner/*" element={<OwnerLayout />} />
                    <Route path="/manager/*" element={<ManagerLayout />} />
                    <Route path="/kitchen/*" element={<ManagerLayout />} />
                    <Route path="/staff/*" element={<ManagerLayout />} />
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
                </POSAPIProvider>
              </TablesAPIProvider>
            </MenuProvider>
          </InventoryAPIProvider>
        </AuthAPIProvider>
      </AppProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;