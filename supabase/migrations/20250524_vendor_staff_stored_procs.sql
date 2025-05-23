
-- Function to add a portfolio item
CREATE OR REPLACE FUNCTION public.add_portfolio_item(
  p_staff_id UUID,
  p_title TEXT,
  p_description TEXT,
  p_category TEXT,
  p_media_type TEXT,
  p_media_url TEXT,
  p_thumbnail_url TEXT,
  p_featured BOOLEAN,
  p_metadata JSONB
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.staff_portfolio_items (
    staff_id,
    title,
    description,
    category,
    media_type,
    media_url,
    thumbnail_url,
    featured,
    metadata
  )
  VALUES (
    p_staff_id,
    p_title,
    p_description,
    p_category,
    p_media_type,
    p_media_url,
    p_thumbnail_url,
    p_featured,
    p_metadata
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Function to delete a portfolio item
CREATE OR REPLACE FUNCTION public.delete_portfolio_item(
  p_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.staff_portfolio_items
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$;

-- Function to update a portfolio item's featured status
CREATE OR REPLACE FUNCTION public.update_portfolio_item_featured(
  p_id UUID,
  p_featured BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.staff_portfolio_items
  SET featured = p_featured
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$;

-- Function to get portfolio items for a staff member
CREATE OR REPLACE FUNCTION public.get_portfolio_items(
  p_staff_id UUID
)
RETURNS SETOF public.staff_portfolio_items
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.staff_portfolio_items
  WHERE staff_id = p_staff_id
  ORDER BY created_at DESC;
END;
$$;

-- Function to get a staff profile
CREATE OR REPLACE FUNCTION public.get_staff_profile(
  p_staff_id UUID
)
RETURNS public.vendor_staff_profiles
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT *
    FROM public.vendor_staff_profiles
    WHERE staff_id = p_staff_id
  );
END;
$$;

-- Function to insert a new staff profile
CREATE OR REPLACE FUNCTION public.insert_staff_profile(
  staff_id UUID,
  bio TEXT,
  specialization TEXT,
  years_experience INTEGER,
  certifications TEXT[],
  social_links JSONB,
  profile_image_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO public.vendor_staff_profiles (
    staff_id,
    bio,
    specialization,
    years_experience,
    certifications,
    social_links,
    profile_image_url
  )
  VALUES (
    staff_id,
    bio,
    specialization,
    years_experience,
    certifications,
    social_links,
    profile_image_url
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$;

-- Function to update an existing staff profile
CREATE OR REPLACE FUNCTION public.update_staff_profile(
  id UUID,
  staff_id UUID,
  bio TEXT,
  specialization TEXT,
  years_experience INTEGER,
  certifications TEXT[],
  social_links JSONB,
  profile_image_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.vendor_staff_profiles
  SET
    bio = update_staff_profile.bio,
    specialization = update_staff_profile.specialization,
    years_experience = update_staff_profile.years_experience,
    certifications = update_staff_profile.certifications,
    social_links = update_staff_profile.social_links,
    profile_image_url = update_staff_profile.profile_image_url,
    updated_at = NOW()
  WHERE
    id = update_staff_profile.id AND
    staff_id = update_staff_profile.staff_id;
  
  RETURN FOUND;
END;
$$;

-- Create or replace the placeholder functions used by the TypeScript code
CREATE OR REPLACE FUNCTION public.create_add_portfolio_item_function()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a placeholder function to avoid TypeScript errors
  -- The actual add_portfolio_item function has already been created above
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_delete_portfolio_item_function()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a placeholder function to avoid TypeScript errors
  -- The actual delete_portfolio_item function has already been created above
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_update_portfolio_item_featured_function()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a placeholder function to avoid TypeScript errors
  -- The actual update_portfolio_item_featured function has already been created above
  RETURN;
END;
$$;
