
import React, { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend, color }) => {
  // Map color names to TailwindCSS classes
  const getColorClass = (colorName: string, type: 'bg' | 'text' | 'accent') => {
    const colorMap: Record<string, Record<string, string>> = {
      'sanskara-red': {
        bg: 'bg-sanskara-red',
        text: 'text-sanskara-red',
        accent: 'bg-sanskara-red/10',
      },
      'sanskara-gold': {
        bg: 'bg-sanskara-gold',
        text: 'text-sanskara-gold',
        accent: 'bg-sanskara-gold/10',
      },
      'sanskara-amber': {
        bg: 'bg-sanskara-amber',
        text: 'text-sanskara-amber',
        accent: 'bg-sanskara-amber/10',
      },
      'sanskara-green': {
        bg: 'bg-green-500',
        text: 'text-green-500',
        accent: 'bg-green-50',
      },
    };

    return colorMap[colorName]?.[type] || colorMap['sanskara-red'][type];
  };

  return (
    <div className="sanskara-card">
      <div className={`absolute top-0 left-0 right-0 h-1 ${getColorClass(color, 'bg')}`}></div>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="text-2xl font-bold">{value}</div>
          
          {trend && (
            <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span className="ml-1">{trend.value}% from last month</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-full ${getColorClass(color, 'accent')} ${getColorClass(color, 'text')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
