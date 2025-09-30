-- Make wedding_id in bookings nullable
ALTER TABLE public.bookings
    ALTER COLUMN wedding_id DROP NOT NULL;

COMMENT ON COLUMN public.bookings.wedding_id IS 'Can be NULL for bookings manually created by vendors, as they might not be tied to a specific wedding event in the platform.';