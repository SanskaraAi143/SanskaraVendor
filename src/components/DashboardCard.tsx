
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom'; // Import Link for footerLink

interface DashboardCardProps {
  title: string;
  value?: string | number; // Made value optional as content might be passed as children
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  children?: ReactNode; // Added children prop for custom content
  footerLink?: { // Added footerLink prop
    text: string;
    href: string;
  };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, trend, color, children, footerLink }) => {
  // Map color names to TailwindCSS classes
  const getColorClass = (colorName: string, type: 'bg' | 'text' | 'accent') => {
    const colorMap: Record<string, Record<string, string>> = {
      'sanskara-red': { bg: 'bg-sanskara-red', text: 'text-sanskara-red', accent: 'bg-sanskara-red/10' },
      'sanskara-gold': { bg: 'bg-sanskara-gold', text: 'text-sanskara-gold', accent: 'bg-sanskara-gold/10' },
      'sanskara-amber': { bg: 'bg-sanskara-amber', text: 'text-sanskara-amber', accent: 'bg-sanskara-amber/10' },
      'sanskara-green': { bg: 'bg-green-500', text: 'text-green-500', accent: 'bg-green-500/10' }, // Adjusted green accent
      'sanskara-blue': { bg: 'bg-blue-500', text: 'text-blue-500', accent: 'bg-blue-500/10' }, // Added blue
      'sanskara-purple': { bg: 'bg-purple-500', text: 'text-purple-500', accent: 'bg-purple-500/10' }, // Added purple
    };
    return colorMap[colorName]?.[type] || colorMap['sanskara-red'][type]; // Default to red if color not found
  };

  return (
    <div className="sanskara-card flex flex-col justify-between h-full"> {/* Ensure card takes full height for flexbox alignment */}
      <div> {/* Content part */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${getColorClass(color, 'bg')}`}></div>
        <div className="flex justify-between items-start p-4"> {/* items-start to align icon properly with text */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            {value && <div className="text-2xl font-bold">{value}</div>}
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
        {children && (
          <div className="p-4 pt-0 text-sm text-muted-foreground">
            {children}
          </div>
        )}
      </div>

      {footerLink && (
        <div className="p-4 border-t border-gray-200 mt-auto"> {/* mt-auto pushes footer to bottom */}
          <Link to={footerLink.href} className={`text-xs font-medium ${getColorClass(color, 'text')} hover:underline`}>
            {footerLink.text} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
