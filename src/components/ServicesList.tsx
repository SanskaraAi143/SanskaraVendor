
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, Plus, CheckCircle, XCircle } from 'lucide-react'; // Added icons for active status
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Service {
  service_id: string;
  service_name: string;
  service_category: string;
  base_price: number;
  description: string;
  price_unit: string | null; // Made price_unit nullable
  is_active: boolean;
}

interface ServicesListProps {
  vendorId?: string;
  showAll?: boolean; // New prop to control number of services shown and UI elements
}

const ServicesList: React.FC<ServicesListProps> = ({ vendorId, showAll = false }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      if (!vendorId) return;
      
      try {
        setIsLoading(true);
        let query = supabase
          .from('vendor_services')
          .select('*')
          .eq('vendor_id', vendorId);

        if (!showAll) { // For widget view, show only active and limited
          query = query.eq('is_active', true).limit(4);
        } else { // For dedicated page, show all, order by active status then name
           query = query.order('is_active', { ascending: false }).order('service_name', { ascending: true });
        }
          
        const { data, error } = await query;
        if (error) throw error;
        
        setServices(data as Service[] || []);
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
  }, [vendorId, showAll]);

  const formatPrice = (price?: number, unit?: string | null) => {
    if (price === undefined || price === null) return "Quote on request";
    
    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
    
    if (unit) {
      return `${formattedPrice} / ${unit}`;
    }
    
    return formattedPrice;
  };

  // TODO: Implement toggle active status if needed on this page for staff
  // const toggleServiceStatus = async (serviceId: string, currentStatus: boolean) => { ... }

  return (
    <Card className={`sanskara-card ${showAll ? 'w-full max-w-5xl mx-auto' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{showAll ? 'All Vendor Services' : 'Your Services'}</span>
          {!showAll && (
            <Link to="/staff/services" className="text-sm font-normal text-sanskara-red flex items-center cursor-pointer hover:underline">
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </CardTitle>
        {showAll && <p className="text-sm text-muted-foreground">Comprehensive list of all services offered by the vendor.</p>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, showAll ? 3 : 2].map((i) => ( // Show more skeletons if showAll is true
              <div key={i} className="flex justify-between items-center p-3 border rounded-md animate-pulse">
                <div>
                  <div className="h-4 w-36 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : services.length > 0 ? (
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.service_id} className={`p-4 border rounded-md hover:shadow-md transition-shadow ${!service.is_active && showAll ? 'bg-gray-50 opacity-70' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-sanskara-blue leading-tight mb-1">{service.service_name}</h3>
                    <Badge variant="outline" className="text-xs mb-1">{service.service_category}</Badge>
                    {showAll && (
                       <Badge variant={service.is_active ? "default" : "destructive"} className={`text-xs ml-2 flex items-center w-fit ${service.is_active ? 'bg-sanskara-green hover:bg-sanskara-green/90 text-white' : 'bg-sanskara-red hover:bg-sanskara-red/90 text-white'}`}>
                        {service.is_active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    )}
                  </div>
                  <div className="text-md font-semibold text-sanskara-red text-right">
                    {formatPrice(service.base_price, service.price_unit)}
                  </div>
                </div>
                {service.description && <p className="text-sm text-gray-600 mt-2">{service.description}</p>}
                {/* Add Edit/Toggle Active buttons if showAll and user has permissions */}
              </div>
            ))}
            {!showAll && (
              <Link to="/services/add"> {/* This link might need to be dynamic for staff if they can add services */}
                <Button variant="outline" className="w-full mt-2 flex items-center justify-center">
                  <Plus className="mr-1 h-4 w-4" /> Add Service
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              {showAll ? 'This vendor has not added any services yet.' : "You haven't added any services yet"}
            </p>
            {!showAll && (
               <Link to="/services/add"> {/* This link might need to be dynamic for staff */}
                <Button className="bg-sanskara-red hover:bg-sanskara-maroon text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Service
                </Button>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServicesList;
