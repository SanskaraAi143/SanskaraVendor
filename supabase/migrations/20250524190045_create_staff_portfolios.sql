-- Create staff_portfolios table
CREATE TABLE staff_portfolios (
    portfolio_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES vendor_staff(staff_id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,
    portfolio_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NULL,
    description TEXT NULL,
    image_urls TEXT[] NULL,
    video_urls TEXT[] NULL,
    generic_attributes JSONB NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_staff_portfolios_staff_id ON staff_portfolios(staff_id);
CREATE INDEX idx_staff_portfolios_vendor_id ON staff_portfolios(vendor_id);
CREATE INDEX idx_staff_portfolios_portfolio_type ON staff_portfolios(portfolio_type);

-- Create trigger for updated_at
CREATE TRIGGER set_staff_portfolios_updated_at
BEFORE UPDATE ON staff_portfolios
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Enable Row Level Security for staff_portfolios table
ALTER TABLE public.staff_portfolios ENABLE ROW LEVEL SECURITY;

-- Grant full access (SELECT, INSERT, UPDATE, DELETE) to staff for their own portfolio entries
CREATE POLICY "Allow staff full access to their own portfolio entries"
ON public.staff_portfolios
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.vendor_staff vs
        WHERE vs.supabase_auth_uid = auth.uid() AND vs.staff_id = staff_portfolios.staff_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.vendor_staff vs
        WHERE vs.supabase_auth_uid = auth.uid() AND vs.staff_id = staff_portfolios.staff_id
    )
);

-- Grant read access to all authenticated users for all portfolio entries (if portfolios are public)
-- If portfolios are meant to be private to the vendor/staff, this policy should NOT be added.
-- Based on the issue "where they can be able to see their data and can upload their portfolios",
-- it implies privacy, so we will NOT add a public read access policy for now.
-- If public visibility of portfolios is a requirement later, a separate policy would be needed.
-- For example:
-- CREATE POLICY "Allow public read access to all portfolio entries"
-- ON public.staff_portfolios
-- FOR SELECT
-- TO authenticated -- or 'anon' if truly public even for non-logged-in users
-- USING (true);
