
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

-- Function to create the add_portfolio_item function (meta-function for StaffPortal.tsx)
CREATE OR REPLACE FUNCTION public.create_add_portfolio_item_function()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Function creation is already handled separately
  -- This is just a placeholder to avoid errors in the TypeScript code
  RETURN;
END;
$$;

-- Function to create the delete_portfolio_item function (meta-function for StaffPortal.tsx)
CREATE OR REPLACE FUNCTION public.create_delete_portfolio_item_function()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Function creation is already handled separately
  -- This is just a placeholder to avoid errors in the TypeScript code
  RETURN;
END;
$$;

-- Function to create the update_portfolio_item_featured function (meta-function for StaffPortal.tsx)
CREATE OR REPLACE FUNCTION public.create_update_portfolio_item_featured_function()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Function creation is already handled separately
  -- This is just a placeholder to avoid errors in the TypeScript code
  RETURN;
END;
$$;
