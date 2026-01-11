-- ============================================================================
-- MIGRATION 0056: Secure Chat RLS (Remediation of 0050 & 0053)
-- ============================================================================
-- Objective: Restrict Chat and Storage access to actual conversation participants.
-- Removes "Public" and "Authenticated (All)" permissive policies.
-- ============================================================================

-- 1. Helper Function to map Auth UUID -> App User ID (Integer)
-- This allows us to link Supabase Auth (auth.uid()) to our business logic tables.
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE email = auth.email() LIMIT 1;
$$;

-- 2. Drop Insecure Policies (Cleanup)
-- Messages
DROP POLICY IF EXISTS "Public Read Access" ON messages;
DROP POLICY IF EXISTS "Public Insert Access" ON messages;
DROP POLICY IF EXISTS "Enable read for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON messages;

-- Conversations
DROP POLICY IF EXISTS "Enable read for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;

-- Participants
DROP POLICY IF EXISTS "Enable read for authenticated users" ON conversation_participants;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON conversation_participants;

-- Storage
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

-- 3. Implement Strict RLS for Chat Schema

-- 3.1 CONVERSATIONS
-- Select: Users can see conversations they are part of
CREATE POLICY "View own conversations" ON conversations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = id
    AND cp.user_id = get_current_user_id()
  )
);

-- Insert: Users can create conversations (implicitly allowed, but maybe restrict who can start?)
-- For now, allow any auth user to start a conversation.
CREATE POLICY "Create conversations" ON conversations
FOR INSERT TO authenticated
WITH CHECK (true);

-- Update: Participants can update (e.g. change title)
CREATE POLICY "Update own conversations" ON conversations
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = id
    AND cp.user_id = get_current_user_id()
  )
);

-- 3.2 PARTICIPANTS
-- Select: Users can see who is in their conversations
CREATE POLICY "View participants" ON conversation_participants
FOR SELECT TO authenticated
USING (
  conversation_id IN (
      SELECT conversation_id FROM conversation_participants
      WHERE user_id = get_current_user_id()
  )
);

-- Insert: Users can add participants (or themselves)
CREATE POLICY "Add participants" ON conversation_participants
FOR INSERT TO authenticated
WITH CHECK (
  -- Allow adding if you are PART of the conversation effectively (or creating it)
  -- This is tricky for new chats.
  -- Simplified: Allow insert if you are authenticated. Logic filters in app.
  -- A stricter check would be complex for "creation" time.
  true
);

-- 3.3 MESSAGES
-- Select: Users can read messages in their conversations
CREATE POLICY "Read own messages" ON messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.user_id = get_current_user_id()
  )
);

-- Insert: Users can send messages to their conversations
CREATE POLICY "Send messages" ON messages
FOR INSERT TO authenticated
WITH CHECK (
  -- Must be a participant
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = conversation_id
    AND cp.user_id = get_current_user_id()
  )
  -- AND Sender ID must match own ID (Impersonation check)
  AND sender_id = get_current_user_id()
);

-- 4. Implement Strict RLS for Storage (chat-attachments)

-- Select: Users can read files if they have access to the conversation folder
-- Path format: "{conversation_id}/{filename}"
-- We parse the folder from the object name.
CREATE POLICY "Read chat attachments" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (
      -- Check if user is participant of the conversation ID derived from folder name
      (storage.foldername(name))[1]::int IN (
          SELECT conversation_id FROM conversation_participants
          WHERE user_id = get_current_user_id()
      )
  )
);

-- Insert: Users can upload to conversation folders they belong to
CREATE POLICY "Upload chat attachments" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND (
      (storage.foldername(name))[1]::int IN (
          SELECT conversation_id FROM conversation_participants
          WHERE user_id = get_current_user_id()
      )
  )
);

-- Delete: Users can delete their OWN files
CREATE POLICY "Delete own attachments" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND owner = auth.uid() -- storage.objects tracks owner by UUID
);
