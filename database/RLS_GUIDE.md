# Row Level Security (RLS) Implementation Guide

## Overview

Row Level Security ensures that users can only access data they're authorized to see, even if they make direct database queries.

---

## Quick Start

### For Development (Testing)
```sql
-- DISABLE RLS for easy testing
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
-- etc...
```

### For Production (Secure)
```sql
-- Run the complete RLS script
-- File: database/rls_policies.sql
```

---

## Understanding RLS Policies

### Policy Structure
```sql
CREATE POLICY "policy_name" ON table_name
    FOR operation  -- SELECT, INSERT, UPDATE, DELETE, ALL
    USING (condition);
```

### User Roles
- **Admin**: Full access to everything
- **Teacher**: Access to their classes and students
- **Student**: Access to their own data
- **Parent**: Access to their children's data

---

## Policies by Table

### Students Table

**Who can do what:**
- ✅ Admins: Full CRUD access
- ✅ Teachers: View students in their classes
- ✅ Students: View their own data only
- ✅ Parents: View their children's data

**Example Policy:**
```sql
CREATE POLICY "Students view own data" ON students
    FOR SELECT
    USING (auth.uid()::text = id::text);
```

### Notices Table

**Who can do what:**
- ✅ Admins: Create, update, delete notices
- ✅ All users: View notices relevant to their role

**Audience Targeting:**
```sql
audience @> '["all"]'::jsonb       -- Everyone
audience @> '["students"]'::jsonb  -- Only students
audience @> '["teachers"]'::jsonb  -- Only teachers
audience @> '["parents"]'::jsonb   -- Only parents
```

### Fees Table

**Who can do what:**
- ✅ Admins: Full access
- ✅ Students: View their own fees
- ✅ Parents: View their children's fees
- ❌ Teachers: No access (privacy)

---

## Implementation Steps

### Step 1: Run RLS Policies Script

```bash
# In Supabase SQL Editor
# Copy and paste: database/rls_policies.sql
# Click "Run"
```

### Step 2: Verify Policies

```sql
-- Check active policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Step 3: Test Access

```sql
-- Test as different roles
SET role = 'authenticated';
SELECT * FROM students; -- Should only see allowed data
```

---

## Common Issues & Solutions

### Issue: "No data showing after enabling RLS"

**Cause:** User doesn't have proper permissions  
**Solution:** 
1. Check if user has correct role in `auth.users`
2. Verify policy logic matches your auth setup
3. Temporarily disable RLS to confirm it's the issue

### Issue: "Admin can't see anything"

**Cause:** Admin role not set correctly  
**Solution:**
```sql
-- Set admin role for a user
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@school.com';
```

### Issue: "Teachers can't mark attendance"

**Cause:** Missing teacher-class assignment  
**Solution:**
```sql
-- Verify teacher is assigned to class
SELECT * FROM teacher_classes 
WHERE teacher_id = 'your-teacher-id';

-- Add assignment if missing
INSERT INTO teacher_classes (teacher_id, class_name)
VALUES (1, '10A');
```

---

## Testing Checklist

### Before Production:

- [ ] Enable RLS on all tables
- [ ] Run RLS policies script
- [ ] Test admin login - should see all data
- [ ] Test teacher login - should see only their classes
- [ ] Test student login - should see only their data
- [ ] Test parent login - should see only their children's data
- [ ] Test creating new records
- [ ] Test updating records
- [ ] Test deleting records (where allowed)
- [ ] Verify realtime subscriptions still work with RLS

---

## Advanced Configurations

### Custom Roles

Add custom roles beyond admin/teacher/student/parent:

```sql
CREATE POLICY "Staff view all students" ON students
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' IN ('admin', 'staff', 'principal')
        )
    );
```

### Time-Based Access

Restrict access based on time:

```sql
CREATE POLICY "Student access during school hours" ON assignments
    FOR SELECT
    USING (
        EXTRACT(HOUR FROM NOW()) BETWEEN 8 AND 18 AND
        student_id::text = auth.uid()::text
    );
```

### IP-Based Restrictions

```sql
CREATE POLICY "Admin from school network only" ON students
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'admin'
            AND current_setting('request.headers')::json->>'x-forwarded-for' LIKE '192.168.%'
        )
    );
```

---

## Migration Path

### From Development to Production:

1. **Development Phase** (Current)
   - RLS disabled for easy testing
   - All users can access all data

2. **Staging Phase** (Recommended)
   - Enable RLS on staging database
   - Test with real user accounts
   - Verify all features work

3. **Production Phase** (Final)
   - Enable RLS on production
   - Monitor for access issues
   - Keep admin backdoor for emergencies

---

## Emergency Access

### Temporary RLS Bypass (Admin Only)

```sql
-- If you need to bypass RLS temporarily for maintenance
ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- DO YOUR MAINTENANCE WORK

-- RE-ENABLE IMMEDIATELY AFTER
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING:** Never leave RLS disabled in production!

---

## Performance Considerations

RLS policies add overhead to queries. Optimize by:

1. **Add Indexes:**
```sql
CREATE INDEX idx_students_grade_section ON students(grade, section);
CREATE INDEX idx_teacher_classes_teacher ON teacher_classes(teacher_id);
```

2. **Simplify Policies:**
- Avoid complex JOINs in policies
- Use materialized views for complex access patterns
- Cache role assignments

3. **Monitor Query Performance:**
```sql
-- See slow queries
SELECT query, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%students%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Files Included

1. **`database/rls_policies.sql`** - Complete RLS policy definitions
2. **`database/RLS_GUIDE.md`** - This documentation

---

## Support

If RLS blocks legitimate access:
1. Check user role assignment
2. Verify policy logic
3. Test with RLS temporarily disabled
4. Check Supabase logs for policy errors

For complex access patterns, consider creating a helper function instead of complex policy logic.
