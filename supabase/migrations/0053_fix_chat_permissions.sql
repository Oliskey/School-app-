-- 1. Create the bucket (safe to run even if exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- 2. RESET Policies (Drops old ones)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 3. Create OPEN Policies (For Mock Auth / MVP)
-- Allow anyone (public/anon) to read files
CREATE POLICY "Public Read Access" ON storage.objects 
  FOR SELECT USING ( bucket_id = 'chat-attachments' );

-- Allow anyone (public/anon) to upload files
-- This effectively disables RLS for inserts on this bucket, which is needed because
-- our mock auth doesn't establish a real authenticated session with Supabase.
CREATE POLICY "Public Upload Access" ON storage.objects 
  FOR INSERT 
  WITH CHECK ( bucket_id = 'chat-attachments' );

-- Allow anyone to update/delete (Optional, you might want to restrict this later)
CREATE POLICY "Public Update Access" ON storage.objects
  FOR UPDATE
  USING ( bucket_id = 'chat-attachments' );

CREATE POLICY "Public Delete Access" ON storage.objects
  FOR DELETE
  USING ( bucket_id = 'chat-attachments' );

-- 4. Fix Messages Table Permissions (also open up for MVP)
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON messages;
DROP POLICY IF EXISTS "Public Insert Access" ON messages;

CREATE POLICY "Public Insert Access" ON messages 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read for authenticated users" ON messages;
DROP POLICY IF EXISTS "Public Read Access" ON messages;

CREATE POLICY "Public Read Access" ON messages 
  FOR SELECT 
  USING (true);

-- 5. Reload Schema Cache
NOTIFY pgrst, 'reload config';
