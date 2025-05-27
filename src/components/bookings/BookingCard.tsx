
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Calendar, MapPin, User, FileText, MessageSquare } from 'lucide-react';

interface BookingCardProps {
  booking: {
    booking_id: string;
    event_date: string;
    event_location?: string;
    booking_status: string;
    custom_instructions?: string;
    notes_for_vendor?: string;
    users?: {
      display_name: string;
      email: string;
    };
    vendor_services?: {
      service_name: string;
    };
  };
  onUpdate: () => void;
  showVendorNotes?: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onUpdate, showVendorNotes = false }) => {
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [vendorNotes, setVendorNotes] = useState(booking.notes_for_vendor || '');
  const [saving, setSaving] = useState(false);

  const handleSaveNotes = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ notes_for_vendor: vendorNotes })
        .eq('booking_id', booking.booking_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Vendor notes updated successfully',
      });
      
      setIsNotesDialogOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating vendor notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vendor notes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(booking.event_date).toLocaleDateString()}
              </div>
              {booking.vendor_services && (
                <p className="font-semibold">{booking.vendor_services.service_name}</p>
              )}
            </div>
            
            {showVendorNotes && (
              <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Vendor Notes</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Booking Details</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Date: {new Date(booking.event_date).toLocaleDateString()}</p>
                        {booking.users && <p>Client: {booking.users.display_name}</p>}
                        {booking.vendor_services && <p>Service: {booking.vendor_services.service_name}</p>}
                      </div>
                    </div>
                    
                    {booking.custom_instructions && (
                      <div>
                        <p className="font-medium mb-1">Client Instructions</p>
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm">{booking.custom_instructions}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vendor Notes</label>
                      <Textarea
                        value={vendorNotes}
                        onChange={(e) => setVendorNotes(e.target.value)}
                        placeholder="Add internal notes about this booking..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveNotes} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Notes'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge className={getStatusColor(booking.booking_status)}>
              {booking.booking_status}
            </Badge>
          </div>
          
          {booking.users && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-1" />
              {booking.users.display_name}
            </div>
          )}
          
          {booking.event_location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              {booking.event_location}
            </div>
          )}
          
          {booking.custom_instructions && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Client Instructions:</p>
              <p className="text-sm text-gray-700">{booking.custom_instructions}</p>
            </div>
          )}
          
          {booking.notes_for_vendor && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Vendor Notes:</p>
              <p className="text-sm text-gray-700">{booking.notes_for_vendor}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
