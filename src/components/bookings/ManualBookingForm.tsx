import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const manualBookingSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().optional(),
  eventDate: z.date({ required_error: 'Event date is required' }),
  totalAmount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Amount must be positive')
  ),
  notes: z.string().optional(),
});

type ManualBookingFormValues = z.infer<typeof manualBookingSchema>;

interface ManualBookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingCreated: () => void;
}

export const ManualBookingForm: React.FC<ManualBookingFormProps> = ({
  open,
  onOpenChange,
  onBookingCreated,
}) => {
  const { user, vendorProfile, staffProfile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ManualBookingFormValues>({
    resolver: zodResolver(manualBookingSchema),
    defaultValues: {
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        totalAmount: 0,
        notes: ''
    }
  });

  const onSubmit = async (data: ManualBookingFormValues) => {
    if (!vendorProfile?.vendor_id) {
      toast({
        title: 'Error',
        description: 'You must be associated with a vendor to create a booking.',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) { // Ensure there's a logged-in user for created_by_staff_id
      toast({
        title: 'Error',
        description: 'User not authenticated.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('bookings').insert([
      {
        vendor_id: vendorProfile.vendor_id,
        event_date: data.eventDate.toISOString().split('T')[0],
        total_amount: data.totalAmount,
        notes_for_vendor: data.notes,
        booking_status: 'confirmed',
        booking_source: 'vendor_manual',
        custom_customer_details: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone,
        },
        created_by_staff_id: staffProfile?.staff_id, // Use staff_id if available, otherwise it will be NULL
      },
    ]);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: 'Error creating booking',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Booking Created',
        description: 'The manual booking has been added successfully.',
      });
      reset();
      onBookingCreated();
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Add a Manual Booking</SheetTitle>
          <SheetDescription>
            Manually record a new booking for your records. This will not be tied to a platform user.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Controller
            name="customerName"
            control={control}
            render={({ field }) => (
              <div>
                <Input placeholder="Customer Name" {...field} />
                {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName.message}</p>}
              </div>
            )}
          />
          <Controller
            name="customerEmail"
            control={control}
            render={({ field }) => (
              <div>
                <Input placeholder="Customer Email" {...field} />
                {errors.customerEmail && <p className="text-red-500 text-sm">{errors.customerEmail.message}</p>}
              </div>
            )}
          />
          <Controller
            name="customerPhone"
            control={control}
            render={({ field }) => <Input placeholder="Customer Phone (Optional)" {...field} />}
          />
          <Controller
            name="eventDate"
            control={control}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.eventDate && <p className="text-red-500 text-sm">{errors.eventDate.message}</p>}
          <Controller
            name="totalAmount"
            control={control}
            render={({ field }) => (
              <div>
                <Input type="number" placeholder="Total Amount" {...field} />
                {errors.totalAmount && <p className="text-red-500 text-sm">{errors.totalAmount.message}</p>}
              </div>
            )}
          />
          <Controller
            name="notes"
            control={control}
            render={({ field }) => <Textarea placeholder="Booking Notes (Optional)" {...field} />}
          />
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Booking'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};