-- Trigger to move verified users from vendor_staff_invite to vendor_staff
CREATE OR REPLACE FUNCTION move_verified_user_to_vendor_staff()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the user is verified
    IF NEW.is_verified THEN
        -- Insert into vendor_staff
        INSERT INTO vendor_staff (vendor_id, supabase_auth_uid, display_name, email, phone_number, role)
        SELECT
            vendor_id,
            NEW.supabase_auth_uid,
            NEW.display_name,
            NEW.email,
            NEW.phone_number,
            role
        FROM vendor_staff_invite
        WHERE email = NEW.email;

        -- Update the invitation status to accepted
        UPDATE vendor_staff_invite
        SET invitation_status = 'accepted'
        WHERE email = NEW.email;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER after_user_verified
AFTER UPDATE OF is_verified ON users
FOR EACH ROW
EXECUTE FUNCTION move_verified_user_to_vendor_staff();
