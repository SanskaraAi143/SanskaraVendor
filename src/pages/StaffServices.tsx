
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Loader2, Plus, Edit3, Save, X, Trash2, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuthContext';
import { toast } from '../hooks/use-toast';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';

interface VendorService {
  service_id: string;
  service_name: string;
  service_category: string;
  description: string | null;
  base_price: number | null;
  price_unit: string | null;
  min_capacity: number | null;
  max_capacity: number | null;
  is_active: boolean;
  is_negotiable: boolean;
  is_in_house: boolean;
  portfolio_image_urls: string[] | null;
  customizability_details: any | null; // Changed from string to any to handle JSONB
  created_at: string;
}

const StaffServices: React.FC = () => {
  const { user, staffProfile } = useAuth();
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editForm, setEditForm] = useState({
    service_name: '',
    service_category: '',
    description: '',
    base_price: '',
    price_unit: 'per_event',
    min_capacity: '',
    max_capacity: '',
    is_active: true,
    is_negotiable: false,
    is_in_house: true,
    customizability_details: ''
  });

  useEffect(() => {
    if (user && staffProfile) {
      fetchServices();
    }
  }, [user, staffProfile]);

  const fetchServices = async () => {
    if (!staffProfile?.vendor_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_services')
        .select('*')
        .eq('vendor_id', staffProfile.vendor_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure proper typing
      const transformedData: VendorService[] = (data || []).map(item => ({
        ...item,
        customizability_details: item.customizability_details
      }));
      
      setServices(transformedData);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Error',
        description: 'Failed to load services',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = async () => {
    if (!staffProfile?.vendor_id || !editForm.service_name || !editForm.service_category) return;

    try {
      const { error } = await supabase
        .from('vendor_services')
        .insert({
          vendor_id: staffProfile.vendor_id,
          responsible_staff_id: staffProfile.staff_id,
          service_name: editForm.service_name,
          service_category: editForm.service_category,
          description: editForm.description || null,
          base_price: editForm.base_price ? parseFloat(editForm.base_price) : null,
          price_unit: editForm.price_unit,
          min_capacity: editForm.min_capacity ? parseInt(editForm.min_capacity) : null,
          max_capacity: editForm.max_capacity ? parseInt(editForm.max_capacity) : null,
          is_active: editForm.is_active,
          is_negotiable: editForm.is_negotiable,
          is_in_house: editForm.is_in_house,
          customizability_details: editForm.customizability_details ? { details: editForm.customizability_details } : null
        });

      if (error) throw error;

      await fetchServices();
      setShowCreateForm(false);
      resetForm();

      toast({
        title: 'Success',
        description: 'Service created successfully'
      });
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to create service',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setEditForm({
      service_name: '',
      service_category: '',
      description: '',
      base_price: '',
      price_unit: 'per_event',
      min_capacity: '',
      max_capacity: '',
      is_active: true,
      is_negotiable: false,
      is_in_house: true,
      customizability_details: ''
    });
  };

  const handleEditService = (service: VendorService) => {
    setEditingService(service.service_id);
    setEditForm({
      service_name: service.service_name,
      service_category: service.service_category,
      description: service.description || '',
      base_price: service.base_price?.toString() || '',
      price_unit: service.price_unit || 'per_event',
      min_capacity: service.min_capacity?.toString() || '',
      max_capacity: service.max_capacity?.toString() || '',
      is_active: service.is_active,
      is_negotiable: service.is_negotiable,
      is_in_house: service.is_in_house,
      customizability_details: typeof service.customizability_details === 'object' && service.customizability_details 
        ? service.customizability_details.details || '' 
        : service.customizability_details || ''
    });
  };

  const handleSaveService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_services')
        .update({
          service_name: editForm.service_name,
          service_category: editForm.service_category,
          description: editForm.description || null,
          base_price: editForm.base_price ? parseFloat(editForm.base_price) : null,
          price_unit: editForm.price_unit,
          min_capacity: editForm.min_capacity ? parseInt(editForm.min_capacity) : null,
          max_capacity: editForm.max_capacity ? parseInt(editForm.max_capacity) : null,
          is_active: editForm.is_active,
          is_negotiable: editForm.is_negotiable,
          is_in_house: editForm.is_in_house,
          customizability_details: editForm.customizability_details ? { details: editForm.customizability_details } : null
        })
        .eq('service_id', serviceId);

      if (error) throw error;

      await fetchServices();
      setEditingService(null);
      toast({
        title: 'Success',
        description: 'Service updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error',
        description: 'Failed to update service',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('vendor_services')
        .delete()
        .eq('service_id', serviceId);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.service_id !== serviceId));
      toast({
        title: 'Success',
        description: 'Service deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete service',
        variant: 'destructive'
      });
    }
  };

  const serviceCategories = [
    'photography', 'catering', 'decoration', 'venue', 'music', 'makeup', 'flowers', 'transport', 'other'
  ];

  const getCustomizabilityText = (details: any): string => {
    if (!details) return '';
    if (typeof details === 'string') return details;
    if (typeof details === 'object' && details.details) return details.details;
    return JSON.stringify(details);
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading services...</span>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Vendor Services</h1>
            <p className="text-muted-foreground">Manage your vendor's service offerings</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Create Service Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Service</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Service Name *</label>
                  <Input
                    value={editForm.service_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="e.g., Wedding Photography"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <select
                    value={editForm.service_category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, service_category: e.target.value }))}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                  >
                    <option value="">Select category</option>
                    {serviceCategories.map(cat => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Base Price</label>
                  <Input
                    type="number"
                    value={editForm.base_price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, base_price: e.target.value }))}
                    placeholder="Enter base price"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Price Unit</label>
                  <select
                    value={editForm.price_unit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price_unit: e.target.value }))}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                  >
                    <option value="per_event">Per Event</option>
                    <option value="per_person">Per Person</option>
                    <option value="per_hour">Per Hour</option>
                    <option value="per_day">Per Day</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Min Capacity</label>
                  <Input
                    type="number"
                    value={editForm.min_capacity}
                    onChange={(e) => setEditForm(prev => ({ ...prev, min_capacity: e.target.value }))}
                    placeholder="Minimum capacity"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Capacity</label>
                  <Input
                    type="number"
                    value={editForm.max_capacity}
                    onChange={(e) => setEditForm(prev => ({ ...prev, max_capacity: e.target.value }))}
                    placeholder="Maximum capacity"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your service..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Customizability Details</label>
                  <Textarea
                    value={editForm.customizability_details}
                    onChange={(e) => setEditForm(prev => ({ ...prev, customizability_details: e.target.value }))}
                    placeholder="What aspects can be customized..."
                    className="mt-1"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2 flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editForm.is_active}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_active: checked }))}
                    />
                    <label className="text-sm">Active</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editForm.is_negotiable}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_negotiable: checked }))}
                    />
                    <label className="text-sm">Price Negotiable</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={editForm.is_in_house}
                      onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, is_in_house: checked }))}
                    />
                    <label className="text-sm">In-house Service</label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateService}>Create Service</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services List */}
        <div className="grid gap-6">
          {services.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
                <p className="text-muted-foreground text-center">
                  Your vendor doesn't have any services listed yet. Add your first service to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            services.map((service) => (
              <Card key={service.service_id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {editingService === service.service_id ? (
                          <Input
                            value={editForm.service_name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, service_name: e.target.value }))}
                            className="font-semibold"
                          />
                        ) : (
                          service.service_name
                        )}
                        <Badge variant={service.is_active ? "default" : "secondary"}>
                          {service.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">
                          {service.service_category.charAt(0).toUpperCase() + service.service_category.slice(1)}
                        </Badge>
                        {service.is_negotiable && <Badge variant="outline">Negotiable</Badge>}
                        {service.is_in_house && <Badge variant="outline">In-house</Badge>}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {editingService === service.service_id ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveService(service.service_id)}>
                            <Save className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingService(null)}>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditService(service)}>
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteService(service.service_id)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {editingService === service.service_id ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <select
                            value={editForm.service_category}
                            onChange={(e) => setEditForm(prev => ({ ...prev, service_category: e.target.value }))}
                            className="w-full mt-1 border rounded-md px-3 py-2"
                          >
                            {serviceCategories.map(cat => (
                              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Base Price</label>
                          <Input
                            type="number"
                            value={editForm.base_price}
                            onChange={(e) => setEditForm(prev => ({ ...prev, base_price: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Service description..."
                        rows={3}
                      />
                      <Textarea
                        value={editForm.customizability_details}
                        onChange={(e) => setEditForm(prev => ({ ...prev, customizability_details: e.target.value }))}
                        placeholder="Customizability details..."
                        rows={2}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Pricing Information</h4>
                          <div className="space-y-1 text-sm">
                            {service.base_price && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                ₹{service.base_price.toLocaleString()} {service.price_unit && `(${service.price_unit.replace('_', ' ')})`}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Capacity</h4>
                          <div className="space-y-1 text-sm">
                            {(service.min_capacity || service.max_capacity) && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {service.min_capacity && service.max_capacity 
                                  ? `${service.min_capacity} - ${service.max_capacity} people`
                                  : service.min_capacity 
                                    ? `Min ${service.min_capacity} people`
                                    : `Max ${service.max_capacity} people`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {service.description && (
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      )}

                      {service.customizability_details && (
                        <div>
                          <h4 className="font-medium mb-2">Customization Options</h4>
                          <p className="text-sm text-muted-foreground">{getCustomizabilityText(service.customizability_details)}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffServices;
