-- Create the chat-attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-attachments', 'chat-attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public access to chat attachments (viewing)
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING ( bucket_id = 'chat-attachments' );

-- Policy to allow authenticated users to upload files
CREATE POLICY "Authenticated Upload" ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK ( bucket_id = 'chat-attachments' );

-- Policy to allow users to update/delete their own files (optional, good for cleanup)
CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING ( bucket_id = 'chat-attachments' AND auth.uid() = owner );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING ( bucket_id = 'chat-attachments' AND auth.uid() = owner );
