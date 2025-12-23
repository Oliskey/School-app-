-- SQL Script to Backfill Missing Profiles
-- Run this in your Supabase Dashboard -> SQL Editor

-- 1. Backfill Students
INSERT INTO public.students (user_id, name, grade, section, attendance_status)
SELECT id, name, 10, 'A', 'Present'
FROM public.users
WHERE role ILIKE 'student'
AND NOT EXISTS (SELECT 1 FROM public.students WHERE user_id = public.users.id);

-- 2. Backfill Teachers
INSERT INTO public.teachers (user_id, name, email, phone)
SELECT id, name, email, 'N/A'
FROM public.users
WHERE role ILIKE 'teacher'
AND NOT EXISTS (SELECT 1 FROM public.teachers WHERE user_id = public.users.id);

-- 3. Backfill Parents
INSERT INTO public.parents (user_id, name, email, phone)
SELECT id, name, email, 'N/A'
FROM public.users
WHERE role ILIKE 'parent'
AND NOT EXISTS (SELECT 1 FROM public.parents WHERE user_id = public.users.id);

-- 4. Check results
SELECT 'Students' as type, count(*) as count FROM public.students
UNION ALL
SELECT 'Teachers' as type, count(*) as count FROM public.teachers
UNION ALL
SELECT 'Parents' as type, count(*) as count FROM public.parents;
