import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const serviceSchema = z.object({
  service_name: z.string().min(2, 'Service name is required'),
  service_category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  base_price: z.number().min(0, 'Price must be a positive number').or(z.string().regex(/^\d+$/, 'Must be a number').transform(Number)),
  price_unit: z.string().optional(),
  is_negotiable: z.boolean().default(false),
  customizability_details: z.string().optional(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  serviceId?: string;
  onSuccess?: () => void;
  initialData?: Partial<ServiceFormValues>;
}

const serviceCategories = [
  "Venue", "Decor", "Catering", "Photography", "Videography", 
  "Makeup", "Clothing", "Music", "Transportation", "Other"
];

const priceUnits = [
  "per event", "per day", "per hour", "per person", "package", "per plate"
];

const ServiceForm: React.FC<ServiceFormProps> = ({ serviceId, onSuccess, initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { vendorProfile } = useAuth();
  const navigate = useNavigate();

  const defaultValues = {
    service_name: '',
    service_category: '',
    description: '',
    base_price: 0,
    price_unit: 'per event',
    is_negotiable: false,
    customizability_details: '',
    ...initialData
  };

  const { control, handleSubmit, formState: { errors } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues
  });

  const onSubmit = async (data: ServiceFormValues) => {
    if (!vendorProfile?.vendor_id) {
      toast({
        title: "Error",
        description: "Vendor profile not found",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const serviceData = {
        ...data,
        vendor_id: vendorProfile.vendor_id,
        // Ensure all required fields have values
        service_name: data.service_name,
        service_category: data.service_category,
      };
      
      let result;
      if (serviceId) {
        // Update existing service
        result = await supabase
          .from('vendor_services')
          .update(serviceData)
          .eq('service_id', serviceId);
      } else {
        // Insert new service
        result = await supabase
          .from('vendor_services')
          .insert(serviceData);
      }
      
      const { error } = result;
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: serviceId ? "Service updated successfully" : "Service added successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard/services');
      }

    } catch (error: any) {
      console.error("Error saving service:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save service",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{serviceId ? "Edit Service" : "Add New Service"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_name">Service Name</Label>
              <Controller
                name="service_name"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="service_name"
                    placeholder="Enter service name"
                    {...field}
                    className={errors.service_name ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.service_name && (
                <p className="text-red-500 text-sm">{errors.service_name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="service_category">Category</Label>
              <Controller
                name="service_category"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger className={errors.service_category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.service_category && (
                <p className="text-red-500 text-sm">{errors.service_category.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea 
                  id="description"
                  placeholder="Describe your service"
                  rows={4}
                  {...field}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_price">Base Price (₹)</Label>
              <Controller
                name="base_price"
                control={control}
                render={({ field }) => (
                  <Input 
                    id="base_price"
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className={errors.base_price ? "border-red-500" : ""}
                  />
                )}
              />
              {errors.base_price && (
                <p className="text-red-500 text-sm">{errors.base_price.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price_unit">Price Unit</Label>
              <Controller
                name="price_unit"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {priceUnits.map(unit => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            
            <div className="space-y-2 flex items-center">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="is_negotiable">Negotiable Price</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Controller
                    name="is_negotiable"
                    control={control}
                    render={({ field }) => (
                      <Switch 
                        id="is_negotiable"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="is_negotiable" className="cursor-pointer">
                    {defaultValues.is_negotiable ? "Yes" : "No"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customizability_details">Customization Details (Optional)</Label>
            <Controller
              name="customizability_details"
              control={control}
              render={({ field }) => (
                <Textarea 
                  id="customizability_details"
                  placeholder="Explain how this service can be customized for clients"
                  rows={3}
                  {...field}
                />
              )}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/dashboard/services')}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
            className="bg-sanskara-red hover:bg-sanskara-maroon text-white"
          >
            {isSubmitting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                {serviceId ? "Updating" : "Creating"}
              </>
            ) : (
              serviceId ? "Update Service" : "Add Service"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ServiceForm;
