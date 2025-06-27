import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color 
}) => {
  const { theme } = useApp();

  const getColorClasses = () => {
    const colors = {
      primary: 'from-primary-500 to-primary-600',
      secondary: 'from-secondary-500 to-secondary-600',
      accent: 'from-accent-500 to-accent-600',
      success: 'from-success-500 to-success-600',
      warning: 'from-warning-500 to-warning-600',
      error: 'from-error-500 to-error-600'
    };
    return colors[color];
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success-600';
      case 'negative':
        return 'text-error-600';
      default:
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
    }
  };

  return (
    <div className={`p-6 rounded-xl ${
      theme === 'dark' 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200'
    } shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses()} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${getChangeColor()}`}>
          {getChangeIcon()}
          <span>{change}</span>
        </div>
      </div>
      
      <div>
        <h3 className={`text-2xl font-bold mb-1 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        } group-hover:scale-105 transition-transform duration-200`}>
          {value}
        </h3>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {title}
        </p>
      </div>
    </div>
  );
};

export default StatsCard;