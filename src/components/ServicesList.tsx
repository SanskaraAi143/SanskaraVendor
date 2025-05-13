
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Edit, ArrowUpRight } from 'lucide-react';

interface Service {
  id: number;
  name: string;
  category: string;
  basePrice: number;
  isActive: boolean;
  responsibleStaff: string;
}

const services: Service[] = [
  {
    id: 1,
    name: 'Premium Photography Package',
    category: 'Photography',
    basePrice: 45000,
    isActive: true,
    responsibleStaff: 'Rahul Kumar',
  },
  {
    id: 2,
    name: 'Classic Decor Package',
    category: 'Decoration',
    basePrice: 65000,
    isActive: true,
    responsibleStaff: 'Meera Singh',
  },
  {
    id: 3,
    name: 'Vegetarian Catering - 100 Guests',
    category: 'Catering',
    basePrice: 85000,
    isActive: true,
    responsibleStaff: 'Vijay Sharma',
  },
  {
    id: 4,
    name: 'Live Music Band',
    category: 'Entertainment',
    basePrice: 35000,
    isActive: false,
    responsibleStaff: 'Ananya Patel',
  },
];

const ServicesList: React.FC = () => {
  return (
    <Card className="sanskara-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Your Services</span>
          <span className="text-sm font-normal text-sanskara-red flex items-center cursor-pointer hover:underline">
            Manage Services <ArrowUpRight className="ml-1 h-4 w-4" />
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service) => (
            <div 
              key={service.id} 
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-md border ${!service.isActive ? 'bg-muted/30' : 'bg-white'}`}
            >
              <div className="mb-2 sm:mb-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{service.name}</h3>
                  {!service.isActive && (
                    <Badge variant="outline" className="text-muted-foreground text-[10px]">Inactive</Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {service.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Base Price: ₹{service.basePrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1 text-sanskara-maroon" />
                    {service.responsibleStaff}
                  </span>
                </div>
              </div>
              
              <button className="flex items-center text-xs text-sanskara-gold hover:text-sanskara-red transition-colors">
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit Service
              </button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesList;
