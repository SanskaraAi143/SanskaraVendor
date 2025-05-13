
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';

interface ServiceType {
  service_id: string;
  service_name: string;
  service_category: string;
  description: string;
  base_price: number;
  price_unit: string;
  is_negotiable: boolean;
}

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { vendorProfile } = useAuth();
  
  useEffect(() => {
    const fetchServices = async () => {
      if (!vendorProfile?.vendor_id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('vendor_services')
          .select('*')
          .eq('vendor_id', vendorProfile.vendor_id)
          .eq('is_active', true);
          
        if (error) throw error;
        
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast({
          title: "Error",
          description: "Could not load your services",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServices();
  }, [vendorProfile]);
  
  const formatPrice = (price: number, unit: string | null) => {
    if (!price) return "N/A";
    return `₹${price.toLocaleString()}${unit ? `/${unit}` : ""}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Services</h1>
          <p className="text-muted-foreground mt-1">
            Manage your services offerings
          </p>
        </div>
        <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
          <p className="ml-3 text-sanskara-maroon">Loading services...</p>
        </div>
      ) : services.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-sanskara-amber/20 p-3 mb-4">
              <PlusCircle className="h-8 w-8 text-sanskara-amber" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Services Found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You haven't added any services yet. Create your first service to start 
              receiving bookings from customers.
            </p>
            <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.service_id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{service.service_name}</CardTitle>
                  <Badge>{service.service_category}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {service.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Base Price:</span>
                  <span className="text-lg font-bold text-sanskara-red">
                    {formatPrice(service.base_price, service.price_unit)}
                  </span>
                </div>
                {service.is_negotiable && (
                  <Badge variant="outline" className="bg-sanskara-amber/10 text-sanskara-amber border-sanskara-amber">
                    Negotiable
                  </Badge>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm" className="flex-1 mr-2">
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 border-red-200 text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
