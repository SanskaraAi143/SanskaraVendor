
-- Create storage bucket for vendor files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vendors',
  'vendors',
  true,
  52428800, -- 50MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'application/pdf'
  ]
);

-- Create policy for vendor file uploads
CREATE POLICY "Authenticated users can upload vendor files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vendors');

-- Create policy for public access to vendor files
CREATE POLICY "Public access to vendor files" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'vendors');

-- Create policy for vendors to update their own files
CREATE POLICY "Vendors can update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'vendors');

-- Create policy for vendors to delete their own files
CREATE POLICY "Vendors can delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'vendors');
