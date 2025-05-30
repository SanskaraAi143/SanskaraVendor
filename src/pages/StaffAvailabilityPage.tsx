
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import AvailabilityCalendar from '../components/staff/AvailabilityCalendar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface StaffAvailabilityRecord {
  staff_availability_id: string;
  staff_id: string;
  vendor_id: string;
  available_date: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const StaffAvailabilityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, staffProfile, isLoading: authLoading } = useAuth();
  const [availabilities, setAvailabilities] = useState<StaffAvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [formData, setFormData] = useState({
    available_date: '',
    status: 'available',
    notes: ''
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    if (staffProfile?.staff_id) {
      loadAvailabilities();
    }
  }, [user, authLoading, navigate, staffProfile]);

  const loadAvailabilities = async () => {
    if (!staffProfile?.staff_id) return;

    try {
      const { data, error } = await supabase
        .from('vendor_staff_availability')
        .select('*')
        .eq('staff_id', staffProfile.staff_id)
        .order('available_date', { ascending: true });

      if (error) throw error;
      setAvailabilities(data || []);
    } catch (err: any) {
      console.error('Error loading availabilities:', err);
      toast({
        title: 'Error',
        description: 'Failed to load availabilities.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (date: string) => {
    const existing = availabilities.find(a => a.available_date.split('T')[0] === date);
    if (existing) {
      setFormData({
        available_date: existing.available_date.split('T')[0],
        status: existing.status,
        notes: existing.notes || ''
      });
    } else {
      setFormData({
        available_date: date,
        status: 'available',
        notes: ''
      });
    }
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!staffProfile?.staff_id || !staffProfile?.vendor_id) return;

    try {
      const existingRecord = availabilities.find(a => 
        a.available_date.split('T')[0] === formData.available_date
      );

      if (existingRecord) {
        // Update existing
        const { error } = await supabase
          .from('vendor_staff_availability')
          .update({
            status: formData.status,
            notes: formData.notes,
          })
          .eq('staff_availability_id', existingRecord.staff_availability_id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('vendor_staff_availability')
          .insert({
            staff_id: staffProfile.staff_id,
            vendor_id: staffProfile.vendor_id,
            available_date: formData.available_date,
            status: formData.status,
            notes: formData.notes,
          });

        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: 'Availability updated successfully.',
      });

      setIsDialogOpen(false);
      loadAvailabilities();
    } catch (err: any) {
      console.error('Error saving availability:', err);
      toast({
        title: 'Error',
        description: 'Failed to save availability.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    const existingRecord = availabilities.find(a => 
      a.available_date.split('T')[0] === formData.available_date
    );

    if (!existingRecord) return;

    try {
      const { error } = await supabase
        .from('vendor_staff_availability')
        .delete()
        .eq('staff_availability_id', existingRecord.staff_availability_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Availability deleted successfully.',
      });

      setIsDialogOpen(false);
      loadAvailabilities();
    } catch (err: any) {
      console.error('Error deleting availability:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete availability.',
        variant: 'destructive',
      });
    }
  };

  if (loading || authLoading) {
    return (
      <StaffDashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading availability...</p>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout>
      <div className="space-y-6 p-4 sm:p-6">
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-sanskara-blue" />
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-700">
                My Availability
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <AvailabilityCalendar
              availabilities={availabilities}
              onDateClick={handleDateClick}
              onAddAvailability={() => {
                setFormData({
                  available_date: new Date().toISOString().split('T')[0],
                  status: 'available',
                  notes: ''
                });
                setIsDialogOpen(true);
              }}
            />
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px] mx-4">
            <DialogHeader>
              <DialogTitle>
                {availabilities.find(a => a.available_date.split('T')[0] === formData.available_date)
                  ? 'Edit Availability' : 'Add Availability'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="available_date">Date</Label>
                <Input
                  id="available_date"
                  type="date"
                  value={formData.available_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, available_date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about your availability..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div>
                {availabilities.find(a => a.available_date.split('T')[0] === formData.available_date) && (
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {availabilities.find(a => a.available_date.split('T')[0] === formData.available_date)
                    ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </StaffDashboardLayout>
  );
};

export default StaffAvailabilityPage;
