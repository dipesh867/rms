/**
 * Login Selector Component
 * Helps users choose the correct login portal
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { Shield, Store, Users, ArrowRight } from 'lucide-react';

const LoginSelector: React.FC = () => {
  const { theme } = useTheme();

  const loginOptions = [
    {
      title: 'Administrator',
      description: 'System administrators and super users',
      icon: Shield,
      path: '/admin/login',
      color: 'red',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    {
      title: 'Restaurant Owner',
      description: 'Restaurant owners and managers',
      icon: Store,
      path: '/owner/login',
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Staff Members',
      description: 'Managers, kitchen staff, waiters & team',
      icon: Users,
      path: '/staff/login',
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Restaurant Management System
          </h1>
          <p className={`mt-4 text-lg ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Choose your login portal to access the system
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {loginOptions.map((option) => {
            const IconComponent = option.icon;
            
            return (
              <div
                key={option.title}
                className={`relative rounded-lg p-8 shadow-lg transition-all duration-200 hover:shadow-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 border border-gray-700' 
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${option.bgColor} mb-6`}>
                  <IconComponent className={`h-8 w-8 ${option.iconColor}`} />
                </div>

                <h3 className={`text-xl font-semibold mb-3 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {option.title}
                </h3>

                <p className={`text-sm mb-6 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {option.description}
                </p>

                <Link
                  to={option.path}
                  className={`inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white rounded-md transition-colors duration-200 ${option.buttonColor}`}
                >
                  Login as {option.title}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className={`mt-12 text-center ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          <p className="text-sm">
            Need help? Contact your system administrator
          </p>
        </div>

        {/* Demo Credentials */}
        <div className={`mt-8 p-6 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className={`text-lg font-medium mb-4 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Demo Credentials for Testing:
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                Administrator
              </h4>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                admin@test.com<br />
                admin123
              </p>
            </div>
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                Owner
              </h4>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                owner@test.com<br />
                owner123
              </p>
            </div>
            <div>
              <h4 className={`font-medium ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                Staff
              </h4>
              <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                manager@test.com / manager123<br />
                kitchen@test.com / kitchen123<br />
                staff@test.com / staff123
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelector;
