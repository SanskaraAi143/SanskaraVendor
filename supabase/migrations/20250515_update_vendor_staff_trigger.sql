-- -------------------- Not working - breaking email verification process ---------------
---------------------------------------------------------------------------------------------
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

-- Trigger to update vendor_staff state to 'active' after email verification
CREATE OR REPLACE FUNCTION update_vendor_staff_state_after_verification()
RETURNS TRIGGER AS $$
BEGIN
    -- If the user's email is verified, set state to 'active'
    IF NEW.email_confirmed_at IS NOT NULL THEN
        UPDATE vendor_staff
        SET state = 'active'
        WHERE email = NEW.email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER after_email_verification
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION update_vendor_staff_state_after_verification();
