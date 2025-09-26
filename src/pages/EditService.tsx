
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ServiceForm from '@/components/service/ServiceForm';
import { toast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const EditService: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceId) {
        navigate('/dashboard/services');
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('vendor_services')
          .select('*')
          .eq('service_id', serviceId)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          toast({
            title: "Service not found",
            description: "The service you're trying to edit doesn't exist",
            variant: "destructive",
          });
          navigate('/dashboard/services');
          return;
        }

        setService(data);
      } catch (error: any) {
        console.error('Error fetching service:', error);
        toast({
          title: "Error",
          description: error.message || "Could not load service details",
          variant: "destructive",
        });
        navigate('/dashboard/services');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [serviceId, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader className="h-10 w-10 animate-spin text-sanskara-red" />
            <p className="mt-4">Loading service details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Edit Service</h1>
        <p className="text-muted-foreground mt-1">
          Update your service details
        </p>
      </div>
      
      {service && <ServiceForm serviceId={serviceId} initialData={service} />}
    </div>
  );
};

export default EditService;
