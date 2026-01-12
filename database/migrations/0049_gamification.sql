-- Add gamification columns to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE students ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Create policy to allow students to update their own XP (optional, but good for real-time games)
-- For security, usually this is done via RPC or edge function, but for now we'll allow direct update if user matches
DROP POLICY IF EXISTS "Students can update their own gamification data" ON students;
CREATE POLICY "Students can update their own gamification data" ON students FOR UPDATE USING (
    auth.uid()::text = user_id::text
) WITH CHECK (
    auth.uid()::text = user_id::text
);
