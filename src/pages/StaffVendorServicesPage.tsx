import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Loader2, Settings, CheckCircle2, XCircle, Star } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface VendorService {
  service_id: string;
  service_name: string;
  description: string | null;
  base_price: number;
  service_category: string | null;
  is_active: boolean;
  responsible_staff_id: string | null;
  is_in_house: boolean | null;
}

const StaffVendorServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, staffProfile, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<VendorService[]>([]);
  const [allServices, setAllServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssigned, setShowAssigned] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    if (staffProfile?.staff_id && staffProfile?.vendor_id) {
      fetchAllServices();
      fetchAssignedServices();
    }
  }, [user, authLoading, navigate, staffProfile]);

  // Fetch all vendor services for the vendor
  const fetchAllServices = async () => {
    if (!staffProfile?.vendor_id) return;
    setLoading(true);
    setError(null);
    try {
      const { data: servicesData, error: servicesError } = await supabase
        .from('vendor_services')
        .select(`
          service_id,
          service_name,
          description,
          base_price,
          service_category,
          is_active,
          responsible_staff_id,
          is_in_house
        `)
        .eq('vendor_id', staffProfile.vendor_id);
      if (servicesError) throw servicesError;
      setAllServices((servicesData as VendorService[]) || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load all services.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch services assigned to this staff via vendor_service_staff
  const fetchAssignedServices = async () => {
    if (!staffProfile?.staff_id) return;
    setLoading(true);
    setError(null);
    try {
      const { data: assignments, error: assignmentError } = await supabase
        .from('vendor_service_staff')
        .select(`
          service_id,
          vendor_services (
            service_id,
            service_name,
            description,
            base_price,
            service_category,
            is_active,
            responsible_staff_id,
            is_in_house
          )
        `)
        .eq('staff_id', staffProfile.staff_id);
      if (assignmentError) throw assignmentError;
      // Flatten and filter out nulls
      const assigned = (assignments || [])
        .map(a => a.vendor_services)
        .filter(Boolean);
      setServices(assigned);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned services.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading services...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      );
    }

    const servicesToShow = showAssigned ? services : allServices;

    return (
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-sanskara-blue" />
              <CardTitle className="text-2xl font-semibold text-gray-700">
                Vendor Services
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant={showAssigned ? "default" : "outline"}
                onClick={() => setShowAssigned(true)}
                size="sm"
              >
                My Services ({services.length})
              </Button>
              <Button
                variant={!showAssigned ? "default" : "outline"}
                onClick={() => setShowAssigned(false)}
                size="sm"
              >
                All Services ({allServices.length})
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {showAssigned 
              ? "Services you are responsible for"
              : "All services offered by your vendor"
            }
          </p>
        </CardHeader>
        <CardContent>
          {servicesToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesToShow.map(service => {
                // In 'My Services' mode, all services in the list are assigned to the staff (via vendor_service_staff)
                // So isAssigned should always be true in this mode
                const isAssigned = showAssigned ? true : (service.responsible_staff_id === staffProfile?.staff_id);

                return (
                  <Card 
                    key={service.service_id} 
                    className={`transition-all hover:shadow-md ${
                      isAssigned ? 'border-sanskara-blue/30 bg-blue-50/30' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Service Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {service.service_name}
                            </h3>
                            <p className="text-2xl font-bold text-sanskara-blue mt-1">
                              ₹{service.base_price?.toFixed(2) || '0.00'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={service.is_active ? "default" : "secondary"}>
                              {service.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {isAssigned && (
                              <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-600">Responsible</span>
                              </div>
                            )}
                            {service.is_in_house && (
                              <Badge variant="outline" className="text-xs">
                                In-House
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Category */}
                        {service.service_category && (
                          <Badge variant="outline" className="w-fit">
                            {service.service_category}
                          </Badge>
                        )}

                        {/* Description */}
                        {service.description && (
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {service.description}
                          </p>
                        )}

                        {/* Assignment Status */}
                        <div className="border-t pt-4">
                          {isAssigned ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm font-medium">You are responsible for this service</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm">Not assigned to this service</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {showAssigned ? "No services assigned to you yet." : "No services found."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {showAssigned 
                  ? "Contact your vendor to get assigned as responsible for services." 
                  : "Your vendor hasn't added any services yet."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <StaffDashboardLayout>
      {renderContent()}
    </StaffDashboardLayout>
  );
};

export default StaffVendorServicesPage;
