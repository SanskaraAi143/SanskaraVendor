
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AvailabilityRecord {
  staff_availability_id: string;
  available_date: string;
  status: string;
  notes?: string;
}

interface AvailabilityCalendarProps {
  availabilities: AvailabilityRecord[];
  onDateClick: (date: string) => void;
  onAddAvailability: () => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  availabilities,
  onDateClick,
  onAddAvailability
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getAvailabilityForDate = (date: Date | null) => {
    if (!date) return null;
    const dateString = date.toISOString().split('T')[0];
    return availabilities.find(a => a.available_date.split('T')[0] === dateString);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{monthName}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onAddAvailability}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((date, index) => {
            const availability = getAvailabilityForDate(date);
            const isToday = date && date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`
                  relative p-2 h-16 border rounded-lg cursor-pointer transition-colors
                  ${date ? 'hover:bg-gray-50' : ''}
                  ${isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
                onClick={() => date && onDateClick(date.toISOString().split('T')[0])}
              >
                {date && (
                  <>
                    <div className="text-sm font-medium">{date.getDate()}</div>
                    {availability && (
                      <Badge
                        variant="outline"
                        className={`absolute bottom-1 left-1 right-1 text-xs ${getStatusColor(availability.status)}`}
                      >
                        {availability.status}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-200 border border-green-300"></div>
            <span className="text-xs text-gray-600">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-200 border border-red-300"></div>
            <span className="text-xs text-gray-600">Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-300"></div>
            <span className="text-xs text-gray-600">Partial</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
