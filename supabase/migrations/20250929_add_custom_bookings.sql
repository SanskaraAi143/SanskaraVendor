-- Make user_id in bookings nullable and add columns for manual bookings
ALTER TABLE public.bookings
    ALTER COLUMN user_id DROP NOT NULL,
    ADD COLUMN custom_customer_details JSONB NULL,
    ADD COLUMN booking_source VARCHAR(50) NOT NULL DEFAULT 'platform',
    ADD COLUMN created_by_staff_id UUID NULL REFERENCES public.vendor_staff(staff_id) ON DELETE SET NULL;

-- Add a constraint to ensure custom_customer_details is not null when user_id is null for manual bookings
ALTER TABLE public.bookings
    ADD CONSTRAINT chk_manual_booking_customer_details
    CHECK (booking_source != 'vendor_manual' OR (user_id IS NULL AND custom_customer_details IS NOT NULL));

-- Make user_id in payments nullable
ALTER TABLE public.payments
    ALTER COLUMN user_id DROP NOT NULL;

-- Add indexes for new columns
CREATE INDEX idx_bookings_booking_source ON public.bookings(booking_source);
CREATE INDEX idx_bookings_created_by_staff_id ON public.bookings(created_by_staff_id);

COMMENT ON COLUMN public.bookings.user_id IS 'Can be NULL for bookings manually created by vendors for non-platform users.';
COMMENT ON COLUMN public.bookings.custom_customer_details IS 'Stores customer info (e.g., name, email, phone) for manual bookings.';
COMMENT ON COLUMN public.bookings.booking_source IS 'Indicates the origin of the booking, e.g., ''platform'' or ''vendor_manual''.';
COMMENT ON COLUMN public.bookings.created_by_staff_id IS 'The staff member who manually created the booking.';
COMMENT ON COLUMN public.payments.user_id IS 'Can be NULL for payments related to manual bookings.';
