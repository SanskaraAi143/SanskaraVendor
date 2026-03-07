
-- Enhanced migration for comprehensive tagged image support
-- This migration drops existing image columns and recreates them as JSONB

-- Drop existing image columns and recreate as JSONB
ALTER TABLE vendors 
DROP COLUMN IF EXISTS portfolio_image_urls,
ADD COLUMN portfolio_image_urls JSONB;

ALTER TABLE vendor_services
DROP COLUMN IF EXISTS portfolio_image_urls,
ADD COLUMN portfolio_image_urls JSONB;

ALTER TABLE staff_portfolios
DROP COLUMN IF EXISTS image_urls,
ADD COLUMN image_urls JSONB,
DROP COLUMN IF EXISTS video_urls,
ADD COLUMN video_urls JSONB;

-- -- Add validation function for tag names
-- CREATE OR REPLACE FUNCTION validate_tag_name(tag_name TEXT)
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   RETURN tag_name IS NOT NULL 
--     AND length(trim(tag_name)) > 0 
--     AND length(trim(tag_name)) <= 50 
--     AND tag_name ~ '^[a-zA-Z0-9\s_-]+$';
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Add function to validate tagged images structure
-- CREATE OR REPLACE FUNCTION validate_tagged_images(tagged_images JSONB)
-- RETURNS BOOLEAN AS $$
-- DECLARE
--   tag_name TEXT;
--   tag_value JSONB;
-- BEGIN
--   IF tagged_images IS NULL THEN
--     RETURN TRUE;
--   END IF;
  
--   IF jsonb_typeof(tagged_images) != 'object' THEN
--     RETURN FALSE;
--   END IF;
  
--   FOR tag_name, tag_value IN SELECT * FROM jsonb_each(tagged_images) LOOP
--     -- Validate tag name
--     IF NOT validate_tag_name(tag_name) THEN
--       RETURN FALSE;
--     END IF;
    
--     -- Validate tag value is array of strings
--     IF jsonb_typeof(tag_value) != 'array' THEN
--       RETURN FALSE;
--     END IF;
    
--     -- Check each URL in the array
--     IF NOT (
--       SELECT bool_and(jsonb_typeof(url) = 'string' AND length(url::text) > 0)
--       FROM jsonb_array_elements(tag_value) AS url
--     ) THEN
--       RETURN FALSE;
--     END IF;
--   END LOOP;
  
--   RETURN TRUE;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Add check constraints for tagged images validation
-- ALTER TABLE vendors 
-- ADD CONSTRAINT check_portfolio_image_urls_format 
--   CHECK (validate_tagged_images(portfolio_image_urls));

-- ALTER TABLE vendor_services 
-- ADD CONSTRAINT check_portfolio_image_urls_format 
--   CHECK (validate_tagged_images(portfolio_image_urls));

-- ALTER TABLE staff_portfolios 
-- ADD CONSTRAINT check_image_urls_format 
--   CHECK (validate_tagged_images(image_urls)),
-- ADD CONSTRAINT check_video_urls_format 
--   CHECK (validate_tagged_images(video_urls));

-- Create indexes for better performance on tag searches
CREATE INDEX IF NOT EXISTS idx_vendors_portfolio_tags 
  ON vendors USING gin (portfolio_image_urls);

CREATE INDEX IF NOT EXISTS idx_vendor_services_portfolio_tags 
  ON vendor_services USING gin (portfolio_image_urls);

CREATE INDEX IF NOT EXISTS idx_staff_portfolios_image_tags 
  ON staff_portfolios USING gin (image_urls);

CREATE INDEX IF NOT EXISTS idx_staff_portfolios_video_tags 
  ON staff_portfolios USING gin (video_urls);
