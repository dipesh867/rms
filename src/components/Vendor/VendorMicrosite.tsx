import React, { useState } from 'react';
import { 
  Globe, 
  Settings, 
  Palette, 
  Upload, 
  Download, 
  Eye, 
  Edit, 
  Save,
  X,
  Plus,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface VendorSite {
  id: string;
  vendorId: string;
  subdomain: string;
  customDomain?: string;
  branding: {
    logo?: string;
    favicon?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    bannerImage?: string;
  };
  content: {
    about: string;
    address: string;
    phone: string;
    email: string;
    openingHours: {
      [key: string]: { open: string; close: string; closed?: boolean };
    };
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
    features: {
      onlineOrdering: boolean;
      tableBooking: boolean;
      delivery: boolean;
      reviews: boolean;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  isActive: boolean;
  lastUpdated: Date;
}

const VendorMicrosite: React.FC = () => {
  const { theme, user } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'design' | 'content' | 'seo' | 'preview'>('overview');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [vendorSite, setVendorSite] = useState<VendorSite>({
    id: '1',
    vendorId: user?.id || '1',
    subdomain: 'bella-italia',
    branding: {
      primaryColor: '#2563eb',
      secondaryColor: '#10b981',
      fontFamily: 'Inter',
    },
    content: {
      about: 'Authentic Italian cuisine in the heart of the city. Experience the finest ingredients and traditional recipes passed down through generations.',
      address: '123 Main Street, Downtown, City 12345',
      phone: '+1 (555) 123-4567',
      email: 'info@bella-italia.com',
      openingHours: {
        monday: { open: '11:00', close: '22:00' },
        tuesday: { open: '11:00', close: '22:00' },
        wednesday: { open: '11:00', close: '22:00' },
        thursday: { open: '11:00', close: '22:00' },
        friday: { open: '11:00', close: '23:00' },
        saturday: { open: '10:00', close: '23:00' },
        sunday: { open: '10:00', close: '21:00' }
      },
      socialMedia: {
        facebook: 'https://facebook.com/bella-italia',
        instagram: 'https://instagram.com/bella-italia',
      },
      features: {
        onlineOrdering: true,
        tableBooking: true,
        delivery: true,
        reviews: true
      }
    },
    seo: {
      title: 'Bella Italia - Authentic Italian Restaurant',
      description: 'Experience authentic Italian cuisine with fresh ingredients and traditional recipes in a warm, welcoming atmosphere.',
      keywords: ['italian restaurant', 'authentic cuisine', 'pizza', 'pasta', 'fine dining']
    },
    isActive: true,
    lastUpdated: new Date()
  });

  const colorPresets = [
    { name: 'Ocean Blue', primary: '#2563eb', secondary: '#06b6d4' },
    { name: 'Forest Green', primary: '#059669', secondary: '#10b981' },
    { name: 'Sunset Orange', primary: '#ea580c', secondary: '#f59e0b' },
    { name: 'Royal Purple', primary: '#7c3aed', secondary: '#a855f7' },
    { name: 'Rose Pink', primary: '#e11d48', secondary: '#f43f5e' },
    { name: 'Charcoal', primary: '#374151', secondary: '#6b7280' }
  ];

  const fontOptions = ['Inter', 'Roboto', 'Poppins', 'Montserrat', 'Open Sans', 'Lato'];

  const generateSiteUrl = (subdomain: string, customDomain?: string) => {
    if (customDomain) return `https://${customDomain}`;
    return `https://${subdomain}.yourplatform.com`;
  };

  const previewSite = () => {
    const url = generateSiteUrl(vendorSite.subdomain, vendorSite.customDomain);
    window.open(url, '_blank');
  };

  const exportSiteData = () => {
    const dataStr = JSON.stringify(vendorSite, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vendorSite.subdomain}-site-data.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Vendor Microsite
          </h1>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Create and manage your custom vendor website
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportSiteData}
            className="bg-secondary-500 hover:bg-secondary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
          <button
            onClick={previewSite}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Eye className="w-4 h-4" />
            <span>Preview Site</span>
          </button>
        </div>
      </div>

      {/* Site Status */}
      <div className={`p-6 rounded-xl ${
        theme === 'dark' 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
      } shadow-lg`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Your Website
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {generateSiteUrl(vendorSite.subdomain, vendorSite.customDomain)}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                vendorSite.isActive ? 'bg-success-500' : 'bg-error-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                vendorSite.isActive ? 'text-success-600' : 'text-error-600'
              }`}>
                {vendorSite.isActive ? 'Live' : 'Offline'}
              </span>
            </div>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Globe },
            { id: 'design', label: 'Design & Branding', icon: Palette },
            { id: 'content', label: 'Content Management', icon: Edit },
            { id: 'seo', label: 'SEO Settings', icon: Star },
            { id: 'preview', label: 'Live Preview', icon: Eye }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : theme === 'dark'
                      ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Stats */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Website Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  1,247
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Page Views
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  342
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Unique Visitors
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  89
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Online Orders
                </div>
              </div>
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  4.8
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Avg Rating
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Activity
            </h3>
            <div className="space-y-3">
              {[
                { action: 'New order received', time: '5 minutes ago', type: 'order' },
                { action: 'Customer review submitted', time: '2 hours ago', type: 'review' },
                { action: 'Menu updated', time: '1 day ago', type: 'update' },
                { action: 'Table booking confirmed', time: '2 days ago', type: 'booking' }
              ].map((activity, index) => (
                <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'order' ? 'bg-success-500' :
                    activity.type === 'review' ? 'bg-yellow-500' :
                    activity.type === 'update' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {activity.action}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Design & Branding Tab */}
      {activeTab === 'design' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Color Scheme */}
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Color Scheme
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setVendorSite(prev => ({
                        ...prev,
                        branding: {
                          ...prev.branding,
                          primaryColor: preset.primary,
                          secondaryColor: preset.secondary
                        }
                      }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        vendorSite.branding.primaryColor === preset.primary
                          ? 'border-primary-500 scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex space-x-1">
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: preset.primary }}
                        ></div>
                        <div 
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: preset.secondary }}
                        ></div>
                      </div>
                      <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {preset.name}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={vendorSite.branding.primaryColor}
                        onChange={(e) => setVendorSite(prev => ({
                          ...prev,
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={vendorSite.branding.primaryColor}
                        onChange={(e) => setVendorSite(prev => ({
                          ...prev,
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={vendorSite.branding.secondaryColor}
                        onChange={(e) => setVendorSite(prev => ({
                          ...prev,
                          branding: { ...prev.branding, secondaryColor: e.target.value }
                        }))}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={vendorSite.branding.secondaryColor}
                        onChange={(e) => setVendorSite(prev => ({
                          ...prev,
                          branding: { ...prev.branding, secondaryColor: e.target.value }
                        }))}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography & Assets */}
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Typography & Assets
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Font Family
                  </label>
                  <select
                    value={vendorSite.branding.fontFamily}
                    onChange={(e) => setVendorSite(prev => ({
                      ...prev,
                      branding: { ...prev.branding, fontFamily: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  >
                    {fontOptions.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Logo Upload
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Click to upload logo or drag and drop
                    </p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Banner Image
                  </label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Upload banner image (1920x600 recommended)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Management Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    About Description
                  </label>
                  <textarea
                    value={vendorSite.content.about}
                    onChange={(e) => setVendorSite(prev => ({
                      ...prev,
                      content: { ...prev.content, about: e.target.value }
                    }))}
                    rows={4}
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
                    Address
                  </label>
                  <input
                    type="text"
                    value={vendorSite.content.address}
                    onChange={(e) => setVendorSite(prev => ({
                      ...prev,
                      content: { ...prev.content, address: e.target.value }
                    }))}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={vendorSite.content.phone}
                      onChange={(e) => setVendorSite(prev => ({
                        ...prev,
                        content: { ...prev.content, phone: e.target.value }
                      }))}
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
                      Email
                    </label>
                    <input
                      type="email"
                      value={vendorSite.content.email}
                      onChange={(e) => setVendorSite(prev => ({
                        ...prev,
                        content: { ...prev.content, email: e.target.value }
                      }))}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Features & Social Media */}
            <div className={`p-6 rounded-xl ${
              theme === 'dark' 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Features & Social Media
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Website Features
                  </label>
                  <div className="space-y-2">
                    {Object.entries(vendorSite.content.features).map(([feature, enabled]) => (
                      <label key={feature} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => setVendorSite(prev => ({
                            ...prev,
                            content: {
                              ...prev.content,
                              features: {
                                ...prev.content.features,
                                [feature]: e.target.checked
                              }
                            }
                          }))}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-3 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Social Media Links
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Facebook className="w-5 h-5 text-blue-600" />
                      <input
                        type="url"
                        placeholder="Facebook URL"
                        value={vendorSite.content.socialMedia.facebook || ''}
                        onChange={(e) => setVendorSite(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            socialMedia: {
                              ...prev.content.socialMedia,
                              facebook: e.target.value
                            }
                          }
                        }))}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <input
                        type="url"
                        placeholder="Instagram URL"
                        value={vendorSite.content.socialMedia.instagram || ''}
                        onChange={(e) => setVendorSite(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            socialMedia: {
                              ...prev.content.socialMedia,
                              instagram: e.target.value
                            }
                          }
                        }))}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <input
                        type="url"
                        placeholder="Twitter URL"
                        value={vendorSite.content.socialMedia.twitter || ''}
                        onChange={(e) => setVendorSite(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            socialMedia: {
                              ...prev.content.socialMedia,
                              twitter: e.target.value
                            }
                          }
                        }))}
                        className={`flex-1 px-3 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700 border-gray-600 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white border border-gray-200'
          } shadow-lg`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Website Preview
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={previewSite}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in New Tab</span>
                </button>
              </div>
            </div>

            {/* Mock Website Preview */}
            <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: vendorSite.branding.primaryColor }}>
              <div className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Globe className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold" style={{ fontFamily: vendorSite.branding.fontFamily }}>
                        Bella Italia
                      </h1>
                      <p className="text-gray-600">Authentic Italian Restaurant</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: vendorSite.branding.primaryColor }}
                    >
                      Order Now
                    </button>
                    <button 
                      className="px-4 py-2 rounded-lg text-white"
                      style={{ backgroundColor: vendorSite.branding.secondaryColor }}
                    >
                      Book Table
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-3">About Us</h2>
                    <p className="text-gray-600 mb-4">{vendorSite.content.about}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{vendorSite.content.address}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{vendorSite.content.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Opening Hours</h3>
                    <div className="space-y-1">
                      {Object.entries(vendorSite.content.openingHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="capitalize">{day}</span>
                          <span>{hours.open} - {hours.close}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            console.log('Saving vendor site:', vendorSite);
            // Save implementation
          }}
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default VendorMicrosite;