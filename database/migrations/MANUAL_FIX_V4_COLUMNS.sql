-- MANUAL FIX V4: ADD MISSING COLUMNS
-- Run this to fix "Column not found" errors.

BEGIN;

-- 1. Ensure 'marks' column exists (Frontend expects it)
ALTER TABLE IF EXISTS public.cbt_questions 
ADD COLUMN IF NOT EXISTS marks INTEGER DEFAULT 1;

-- 2. Ensure 'points' column exists (Just in case)
ALTER TABLE IF EXISTS public.cbt_questions 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 1;

-- 3. Ensure 'exam_id' column exists (New Schema)
ALTER TABLE IF EXISTS public.cbt_questions 
ADD COLUMN IF NOT EXISTS exam_id BIGINT REFERENCES public.cbt_exams(id) ON DELETE CASCADE;

-- 4. Ensure 'cbt_exam_id' column exists (Old Schema - for backward compat)
ALTER TABLE IF EXISTS public.cbt_questions 
ADD COLUMN IF NOT EXISTS cbt_exam_id BIGINT REFERENCES public.cbt_exams(id) ON DELETE CASCADE;

-- 5. Force Disable RLS again just to be safe
ALTER TABLE IF EXISTS public.cbt_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cbt_exams DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cbt_results DISABLE ROW LEVEL SECURITY;

COMMIT;
