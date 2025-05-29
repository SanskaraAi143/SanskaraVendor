DO $$
BEGIN
    -- Check and alter 'vendors' table
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' -- Assuming public schema
          AND table_name = 'vendors'
          AND column_name = 'portfolio_image_urls'
          AND (udt_name = '_text' OR data_type = 'ARRAY') -- Check for TEXT[] (udt_name = '_text') or general ARRAY type if udt_name is different
    ) THEN
        -- Check if the column is not already JSONB
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'vendors'
              AND column_name = 'portfolio_image_urls'
              AND (data_type = 'jsonb' OR udt_name = 'jsonb')
        ) THEN
            ALTER TABLE public.vendors
            ALTER COLUMN portfolio_image_urls TYPE JSONB
            USING CASE
                WHEN portfolio_image_urls IS NULL OR cardinality(portfolio_image_urls) = 0 THEN NULL
                ELSE jsonb_build_object('general', array_to_json(portfolio_image_urls)::jsonb)
            END;
        END IF;
    END IF;

    -- Check and alter 'staff_portfolios' table
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' -- Assuming public schema
          AND table_name = 'staff_portfolios'
          AND column_name = 'image_urls'
          AND (udt_name = '_text' OR data_type = 'ARRAY') -- Check for TEXT[] or general ARRAY type
    ) THEN
        -- Check if the column is not already JSONB
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'staff_portfolios'
              AND column_name = 'image_urls'
              AND (data_type = 'jsonb' OR udt_name = 'jsonb')
        ) THEN
            ALTER TABLE public.staff_portfolios
            ALTER COLUMN image_urls TYPE JSONB
            USING CASE
                WHEN image_urls IS NULL OR cardinality(image_urls) = 0 THEN NULL
                ELSE jsonb_build_object('general', array_to_json(image_urls)::jsonb)
            END;
        END IF;
    END IF;
END $$;
