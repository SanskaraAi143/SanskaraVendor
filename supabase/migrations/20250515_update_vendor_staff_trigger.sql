
-- Create a trigger function to update vendor_staff when a user accepts an invitation
CREATE OR REPLACE FUNCTION handle_staff_invitation_accepted()
RETURNS TRIGGER AS $$
BEGIN
    -- When a user is created or updated, check if they have a pending invitation
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.email <> NEW.email) THEN
        -- Update any pending invitations
        UPDATE vendor_staff
        SET 
            supabase_auth_uid = NEW.id,
            invitation_status = 'accepted',
            updated_at = NOW()
        WHERE 
            email = NEW.email AND
            invitation_status = 'pending';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
DROP TRIGGER IF EXISTS staff_invitation_accepted_trigger ON auth.users;
CREATE TRIGGER staff_invitation_accepted_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_staff_invitation_accepted();
