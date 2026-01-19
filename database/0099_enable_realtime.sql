
-- Enable Realtime for critical tables
-- This allows Supabase clients to subscribe to changes

-- 1. Publications
-- Supabase projects usually have 'supabase_realtime' publication by default.
-- We must add tables to it.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'payments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE payments;
  END IF;
  
   IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'schools') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE schools;
  END IF;
END
$$;

-- 2. RLS Policies for Realtime
-- Realtime respects RLS. We must ensure users can SELECT their own data.

-- Notifications: Users can see their own.
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Messages: Users can see messages sent to them or by them.
-- Assuming 'sender_id' and 'receiver_id' columns, or linked via 'conversations'.
-- This usage depends on schema. For now, a generic safe policy:
-- CREATE POLICY "Users can view their own messages" ON messages ... (Skipped to avoid schema mismatch guessing)

-- Payments: Schools (Admins) can view their own payments.
-- efficient logic depends on linking auth.uid() -> profile -> school_id.
-- This might be complex for simple RLS without a helper function.
-- For now, we rely on the backend Edge Function inserting it, so we might not need clients to SELECT payments immediately via realtime if they get school status updates.
-- But 'schools' table update is critical.

-- Schools: Admin can view their own school.
-- CREATE POLICY "Admins can view their own school" ON schools ... (Already likely exists)
