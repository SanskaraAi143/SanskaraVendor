
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Service {
  service_id: string;
  service_name: string;
  service_category: string;
  base_price: number;
  description: string;
  price_unit: string;
  is_active: boolean;
}

interface ServicesListProps {
  vendorId?: string;
}

const ServicesList: React.FC<ServicesListProps> = ({ vendorId }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!vendorId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('vendor_services')
          .select('*')
          .eq('vendor_id', vendorId)
          .eq('is_active', true)
          .limit(4);
          
        if (error) throw error;
        
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Could not load services",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, [vendorId]);

  const formatPrice = (price?: number, unit?: string) => {
    if (price === undefined) return "Quote on request";
    
    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
    
    if (unit) {
      return `${formattedPrice} ${unit}`;
    }
    
    return formattedPrice;
  };

  return (
    <Card className="sanskara-card">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>Your Services</span>
          <Link to="/services" className="text-sm font-normal text-sanskara-red flex items-center cursor-pointer hover:underline">
            View All <ArrowUpRight className="ml-1 h-4 w-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-md animate-pulse">
                <div>
                  <div className="h-4 w-28 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.service_id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/40">
                <div>
                  <h3 className="font-medium leading-none mb-1">{service.service_name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {service.service_category}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-sanskara-red">
                  {formatPrice(service.base_price, service.price_unit)}
                </div>
              </div>
            ))}
            <Link to="/services/add">
              <Button variant="outline" className="w-full mt-2 flex items-center justify-center">
                <Plus className="mr-1 h-4 w-4" /> Add Service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">You haven't added any services yet</p>
            <Link to="/services/add">
              <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Service
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesList;
