
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
  return (
    <div className="sanskara-card">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-${color}`}></div>
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
        
        <div className={`p-3 rounded-full bg-${color}/10 text-${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
