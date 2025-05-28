
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Loader2, Plus, Calendar, Edit3, Save, X, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuthContext';
import { toast } from '../hooks/use-toast';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';

interface VendorAvailability {
  availability_id: string;
  available_date: string;
  status: string;
  notes: string | null;
  created_at: string;
}

const StaffAvailability: React.FC = () => {
  const { user, staffProfile } = useAuth();
  const [availability, setAvailability] = useState<VendorAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAvailability, setEditingAvailability] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editForm, setEditForm] = useState({
    available_date: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    if (user && staffProfile) {
      fetchAvailability();
    }
  }, [user, staffProfile]);

  const fetchAvailability = async () => {
    if (!staffProfile?.vendor_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vendor_availability')
        .select('*')
        .eq('vendor_id', staffProfile.vendor_id)
        .order('available_date', { ascending: true });

      if (error) throw error;
      setAvailability(data || []);
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to load availability',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAvailability = async () => {
    if (!staffProfile?.vendor_id || !editForm.available_date) return;

    try {
      const { error } = await supabase
        .from('vendor_availability')
        .insert({
          vendor_id: staffProfile.vendor_id,
          available_date: editForm.available_date,
          status: editForm.status,
          notes: editForm.notes || null
        });

      if (error) throw error;

      await fetchAvailability();
      setShowCreateForm(false);
      setEditForm({
        available_date: '',
        status: 'available',
        notes: ''
      });

      toast({
        title: 'Success',
        description: 'Availability added successfully'
      });
    } catch (error: any) {
      console.error('Error creating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to add availability',
        variant: 'destructive'
      });
    }
  };

  const handleEditAvailability = (item: VendorAvailability) => {
    setEditingAvailability(item.availability_id);
    setEditForm({
      available_date: item.available_date,
      status: item.status,
      notes: item.notes || ''
    });
  };

  const handleSaveAvailability = async (availabilityId: string) => {
    try {
      const { error } = await supabase
        .from('vendor_availability')
        .update({
          available_date: editForm.available_date,
          status: editForm.status,
          notes: editForm.notes || null
        })
        .eq('availability_id', availabilityId);

      if (error) throw error;

      await fetchAvailability();
      setEditingAvailability(null);
      toast({
        title: 'Success',
        description: 'Availability updated successfully'
      });
    } catch (error: any) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAvailability = async (availabilityId: string) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;

    try {
      const { error } = await supabase
        .from('vendor_availability')
        .delete()
        .eq('availability_id', availabilityId);

      if (error) throw error;

      setAvailability(prev => prev.filter(item => item.availability_id !== availabilityId));
      toast({
        title: 'Success',
        description: 'Availability deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete availability',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'booked': return 'bg-red-100 text-red-800';
      case 'unavailable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (loading) {
    return (
      <StaffDashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading availability...</span>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Vendor Availability</h1>
            <p className="text-muted-foreground">Manage your vendor's availability calendar</p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Availability
          </Button>
        </div>

        {/* Create Availability Form */}
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Date *</label>
                  <Input
                    type="date"
                    value={editForm.available_date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, available_date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 border rounded-md px-3 py-2"
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Optional notes"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleCreateAvailability}>Add Availability</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Availability List */}
        <div className="grid gap-4">
          {availability.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Availability Set</h3>
                <p className="text-muted-foreground text-center">
                  Add availability slots to let customers know when your vendor is available for bookings.
                </p>
              </CardContent>
            </Card>
          ) : (
            availability.map((item) => (
              <Card key={item.availability_id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingAvailability === item.availability_id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="date"
                              value={editForm.available_date}
                              onChange={(e) => setEditForm(prev => ({ ...prev, available_date: e.target.value }))}
                            />
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                              className="border rounded-md px-3 py-2"
                            >
                              <option value="available">Available</option>
                              <option value="booked">Booked</option>
                              <option value="unavailable">Unavailable</option>
                            </select>
                          </div>
                          <Input
                            value={editForm.notes}
                            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Notes"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium">{formatDate(item.available_date)}</h3>
                            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      {editingAvailability === item.availability_id ? (
                        <>
                          <Button size="sm" onClick={() => handleSaveAvailability(item.availability_id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingAvailability(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEditAvailability(item)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteAvailability(item.availability_id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffAvailability;
