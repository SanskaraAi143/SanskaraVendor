import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import ServiceStaffAssignment from '@/components/vendor/ServiceStaffAssignment';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [selectedServiceForStaff, setSelectedServiceForStaff] = useState<string | null>(null);
  const { vendorProfile } = useAuth();
  const navigate = useNavigate();
  
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
      
      console.log("Fetched services:", data);
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
  
  useEffect(() => {
    fetchServices();
  }, [vendorProfile]);
  
  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      // Instead of actually deleting, we set is_active to false
      const { error } = await supabase
        .from('vendor_services')
        .update({ is_active: false })
        .eq('service_id', serviceToDelete);
        
      if (error) throw error;
      
      setServices(services.filter(service => service.service_id !== serviceToDelete));
      toast({
        title: "Service deleted",
        description: "The service has been successfully removed",
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Could not delete the service",
        variant: "destructive",
      });
    } finally {
      setServiceToDelete(null);
    }
  };
  
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
        <Button 
          className="bg-sanskara-red hover:bg-sanskara-maroon text-white"
          onClick={() => navigate('/services/add')}
        >
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
            <Button 
              className="bg-sanskara-red hover:bg-sanskara-maroon text-white"
              onClick={() => navigate('/services/add')}
            >
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
              <CardFooter className="border-t pt-4 flex flex-col gap-2">
                <div className="flex w-full gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/services/edit/${service.service_id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => setServiceToDelete(service.service_id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          Delete Service
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this service? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setServiceToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600"
                          onClick={handleDeleteService}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <Dialog 
                  open={selectedServiceForStaff === service.service_id} 
                  onOpenChange={(open) => setSelectedServiceForStaff(open ? service.service_id : null)}
                >
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setSelectedServiceForStaff(service.service_id)}
                    >
                      <Users className="h-4 w-4 mr-1" /> Assign Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Assign Staff to {service.service_name}</DialogTitle>
                    </DialogHeader>
                    {selectedServiceForStaff === service.service_id && vendorProfile?.vendor_id && (
                      <ServiceStaffAssignment 
                        serviceId={service.service_id} 
                        vendorId={vendorProfile.vendor_id}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
