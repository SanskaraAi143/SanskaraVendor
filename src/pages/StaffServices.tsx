import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc
} from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import ServiceImageManager from '@/components/service/ServiceImageManager';

interface AssignedService {
  service_id: string;
  service_name: string;
  service_category: string;
  description: string;
  base_price: number;
  price_unit: string;
  is_negotiable: boolean;
  vendor_id: string;
  vendor_name: string;
}

const StaffServices: React.FC = () => {
  const [assignedServices, setAssignedServices] = useState<AssignedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<AssignedService | null>(null);
  const { user, staffProfile, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && staffProfile) {
      fetchAssignedServices();
    }
  }, [user, staffProfile, authLoading]);

  const fetchAssignedServices = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      if (!staffProfile) {
        toast({
          title: 'Error',
          description: 'Staff profile not found',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      const staffId = staffProfile.staff_id;
      const vendorId = staffProfile.vendor_id;

      // Get vendor name
      let vendorName = 'Unknown Vendor';
      if (vendorId) {
        const vendorSnap = await getDoc(doc(db, 'vendors', vendorId));
        if (vendorSnap.exists()) {
          vendorName = vendorSnap.data().vendor_name || 'Unknown Vendor';
        }
      }

      // 2. Get assigned services
      const assignmentsQuery = query(
        collection(db, 'vendor_service_staff'),
        where('staff_id', '==', staffId)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);

      const services = await Promise.all(assignmentsSnapshot.docs.map(async (aDoc) => {
        const data = aDoc.data();
        if (data.service_id) {
          const serviceSnap = await getDoc(doc(db, 'vendor_services', data.service_id));
          if (serviceSnap.exists()) {
            const sData = serviceSnap.data();
            return {
              service_id: serviceSnap.id,
              service_name: sData.service_name || 'Unknown Service',
              service_category: sData.service_category || 'Unknown',
              description: sData.description || '',
              base_price: sData.base_price || 0,
              price_unit: sData.price_unit || '',
              is_negotiable: sData.is_negotiable || false,
              vendor_id: sData.vendor_id || '',
              vendor_name: vendorName
            } as AssignedService;
          }
        }
        return null;
      }));

      setAssignedServices(services.filter(Boolean) as AssignedService[]);
    } catch (error) {
      console.error('Error fetching assigned services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assigned services',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number, unit: string | null) => {
    if (!price) return "N/A";
    return `₹${price.toLocaleString()}${unit ? `/${unit}` : ""}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-sanskara-red" />
        <p className="ml-3 text-sanskara-maroon">Loading assigned services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Assigned Services</h1>
          <p className="text-muted-foreground mt-1">
            Services you are assigned to work on
          </p>
        </div>
      </div>

      {assignedServices.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-sanskara-amber/20 p-3 mb-4">
              <ImageIcon className="h-8 w-8 text-sanskara-amber" />
            </div>
            <h3 className="text-xl font-medium mb-2">No Services Assigned</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              You haven't been assigned to any services yet. Contact your vendor to get assigned to services.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedServices.map((service) => (
            <Card key={service.service_id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.service_name}</CardTitle>
                  <Badge>{service.service_category}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {service.description || "No description available"}
                </CardDescription>
                <div className="text-sm text-gray-600">
                  Vendor: {service.vendor_name}
                </div>
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
              <CardContent className="border-t pt-4">
                <Dialog
                  open={selectedService?.service_id === service.service_id}
                  onOpenChange={(open) => setSelectedService(open ? service : null)}
                >
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      View Portfolio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{service.service_name} - Portfolio</DialogTitle>
                    </DialogHeader>
                    {selectedService?.service_id === service.service_id && (
                      <ServiceImageManager
                        serviceId={service.service_id}
                        serviceName={service.service_name}
                        serviceCategory={service.service_category}
                        vendorId={service.vendor_id}
                        canEdit={false} // Staff can only view, not edit
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffServices;
