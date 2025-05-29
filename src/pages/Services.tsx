import React, { useState, useEffect } from 'react'; // Keep useEffect for error handling
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  // Ensure other fields used in the component are here, e.g., is_active if needed directly
}

const getVendorServices = async (vendorId: string): Promise<ServiceType[]> => {
  if (!vendorId) throw new Error("Vendor ID is required to fetch services.");
  const { data, error } = await supabase
    .from('vendor_services')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('is_active', true); // Assuming you still only want active services
  if (error) throw error;
  return data || [];
};

const deleteVendorServiceMutationFn = async (serviceId: string) => {
  if (!serviceId) throw new Error("Service ID is required for deletion.");
  const { error } = await supabase
    .from('vendor_services')
    .update({ is_active: false }) // Soft delete
    .eq('service_id', serviceId);
  if (error) throw error;
  return serviceId; 
};

const Services: React.FC = () => {
  const queryClient = useQueryClient();
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [selectedServiceForStaff, setSelectedServiceForStaff] = useState<string | null>(null);
  const { vendorProfile } = useAuth();
  const navigate = useNavigate();

  const { 
    data: services, 
    isLoading, 
    isError, 
    error 
  } = useQuery<ServiceType[], Error>(
    ['services', vendorProfile?.vendor_id],
    () => getVendorServices(vendorProfile!.vendor_id!),
    {
      enabled: !!vendorProfile?.vendor_id,
    }
  );

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error',
        description: error.message || 'Could not load your services',
        variant: 'destructive',
      });
    }
  }, [isError, error]);

  const deleteServiceMutation = useMutation(
    deleteVendorServiceMutationFn,
    {
      onSuccess: () => {
        toast({
          title: "Service deleted",
          description: "The service has been successfully removed",
        });
        queryClient.invalidateQueries(['services', vendorProfile?.vendor_id]);
        setServiceToDelete(null); // Close the dialog
      },
      onError: (err: Error) => {
        toast({
          title: "Error",
          description: err.message || "Could not delete the service",
          variant: "destructive",
        });
        setServiceToDelete(null); // Close the dialog
      },
    }
  );
  
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
      
      {isLoading && !isError ? ( // Show loading indicator only if loading and no error
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
          <p className="ml-3 text-sanskara-maroon">Loading services...</p>
        </div>
      ) : isError ? ( // Show error message if there's an error
        <Card className="border-dashed border-2 border-red-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-red-600">Failed to Load Services</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              {error?.message || "An unexpected error occurred. Please try again later."}
            </p>
            <Button 
              variant="outline"
              onClick={() => queryClient.refetchQueries(['services', vendorProfile?.vendor_id])}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : services && services.length === 0 ? (
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
          {services && services.map((service) => ( // Added services && to ensure services is defined
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
                          onClick={() => {
                            if (serviceToDelete) {
                              deleteServiceMutation.mutate(serviceToDelete);
                            }
                          }}
                          disabled={deleteServiceMutation.isLoading}
                        >
                          {deleteServiceMutation.isLoading ? 'Deleting...' : 'Delete'}
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
      {/* Fallback for when services is undefined and not loading (e.g. vendorProfile not loaded yet) */}
      {!isLoading && !isError && !services && (
         <div className="flex justify-center items-center py-20">
          <p className="text-muted-foreground">Waiting for vendor information...</p>
        </div>
      )}
    </div>
  );
};

export default Services;
