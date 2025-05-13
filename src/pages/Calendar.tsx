
import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Mock data for events
const EVENTS = [
  { date: '2025-05-14', status: 'available' },
  { date: '2025-05-15', status: 'booked_confirmed', client: 'Vikram & Ananya', details: 'Wedding Photography' },
  { date: '2025-05-18', status: 'available' },
  { date: '2025-05-20', status: 'booked_tentative', client: 'Rahul & Priya', details: 'Pre-Wedding Shoot' },
  { date: '2025-05-25', status: 'booked_confirmed', client: 'Arjun & Meera', details: 'Full Wedding Package' },
  { date: '2025-06-01', status: 'available' },
  { date: '2025-06-05', status: 'unavailable_custom', details: 'Team Off Day' },
];

const CalendarPage: React.FC = () => {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);
  
  const renderDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border-t border-r p-1"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const event = EVENTS.find(e => e.date === dateString);
      
      let statusClass = '';
      let statusBadge = null;
      
      if (event) {
        switch (event.status) {
          case 'available':
            statusClass = 'border-green-300 bg-green-50';
            statusBadge = (
              <Badge className="bg-green-100 text-green-800 border border-green-200 mb-1">
                Available
              </Badge>
            );
            break;
          case 'booked_confirmed':
            statusClass = 'border-sanskara-red bg-sanskara-red/5';
            statusBadge = (
              <Badge className="bg-sanskara-red/10 text-sanskara-red border border-sanskara-red/20 mb-1">
                Booked
              </Badge>
            );
            break;
          case 'booked_tentative':
            statusClass = 'border-amber-300 bg-amber-50';
            statusBadge = (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200 mb-1">
                Tentative
              </Badge>
            );
            break;
          case 'unavailable_custom':
            statusClass = 'border-gray-300 bg-gray-50';
            statusBadge = (
              <Badge className="bg-gray-100 text-gray-800 border border-gray-200 mb-1">
                Unavailable
              </Badge>
            );
            break;
        }
      }
      
      days.push(
        <div 
          key={day} 
          className={`h-24 border-t border-r p-1 ${statusClass}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-sm font-medium ${event ? 'text-sanskara-maroon' : ''}`}>{day}</span>
            {statusBadge}
          </div>
          {event && event.client && (
            <div className="mt-1">
              <p className="text-xs font-medium truncate">{event.client}</p>
              <p className="text-xs text-muted-foreground truncate">{event.details}</p>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Availability Calendar</h1>
        <p className="text-muted-foreground mt-1">
          Manage your availability and view upcoming bookings.
        </p>
      </div>
      
      <Card className="sanskara-card overflow-visible">
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-sanskara-maroon mr-2" />
              <h2 className="text-xl font-semibold">{MONTHS[month]} {year}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToPreviousMonth}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={goToNextMonth}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-l border-b">
            {/* Day headers */}
            {DAYS.map(day => (
              <div key={day} className="h-10 flex items-center justify-center border-t font-medium text-sanskara-maroon">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {renderDays()}
          </div>
          
          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-50 border border-green-300 rounded mr-2"></div>
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-sanskara-red/5 border border-sanskara-red rounded mr-2"></div>
              <span className="text-sm">Booked (Confirmed)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-amber-50 border border-amber-300 rounded mr-2"></div>
              <span className="text-sm">Booked (Tentative)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border border-gray-300 rounded mr-2"></div>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarPage;
