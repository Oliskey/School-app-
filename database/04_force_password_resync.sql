-- ============================================================================
-- 🔐 FORCE RE-SYNC PASSWORDS (v3 - ROBUST & EXPLICIT)
-- ============================================================================
-- This script fixes the "Invalid Credentials" issue by:
-- 1. Explicitly defining passwords for Demo Accounts (parent1234, etc.)
-- 2. Using robust logic for all other accounts.
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_all_public_users_to_auth()
RETURNS void AS $$
DECLARE
    r RECORD;
    new_id UUID;
    v_surname TEXT;
    v_password TEXT;
BEGIN
    -- 1. Sync Students (Role: 'student')
    FOR r IN SELECT * FROM students WHERE email IS NOT NULL LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = r.email) THEN
            new_id := gen_random_uuid();
            
            -- Logic: Trim name, get last part, lowercase
            v_surname := lower(split_part(trim(r.name), ' ', array_length(regexp_split_to_array(trim(r.name), ' '), 1)));
            v_password := v_surname || '1234';

            -- 🛡️ SAFETY NET: Explicitly set passwords for Demo Users
            IF r.email = 'student@school.com' THEN v_password := 'student1234'; END IF;
            IF r.email = 'jane.smith@student.school.com' THEN v_password := 'smith1234'; END IF;

            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated', 
                r.email, 
                crypt(v_password, gen_salt('bf')), 
                NOW(),
                '{"provider": "email", "providers": ["email"]}',
                jsonb_build_object('role', 'student'),
                NOW(), NOW()
            );
            INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
            VALUES (new_id, new_id, jsonb_build_object('sub', new_id, 'email', r.email), 'email', new_id, NOW(), NOW(), NOW());
        END IF;
    END LOOP;

    -- 2. Sync Teachers (Role: 'teacher')
    FOR r IN SELECT * FROM teachers WHERE email IS NOT NULL LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = r.email) THEN
            new_id := gen_random_uuid();

            v_surname := lower(split_part(trim(r.name), ' ', array_length(regexp_split_to_array(trim(r.name), ' '), 1)));
            v_password := v_surname || '1234';

            -- 🛡️ SAFETY NET
            IF r.email = 'teacher@school.com' THEN v_password := 'teacher1234'; END IF;

            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated', 
                r.email, 
                crypt(v_password, gen_salt('bf')),
                NOW(),
                '{"provider": "email", "providers": ["email"]}',
                jsonb_build_object('role', 'teacher'),
                NOW(), NOW()
            );
            INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
            VALUES (new_id, new_id, jsonb_build_object('sub', new_id, 'email', r.email), 'email', new_id, NOW(), NOW(), NOW());
        END IF;
    END LOOP;

    -- 3. Sync Parents (Role: 'parent')
    FOR r IN SELECT * FROM parents WHERE email IS NOT NULL LOOP
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = r.email) THEN
            new_id := gen_random_uuid();

            v_surname := lower(split_part(trim(r.name), ' ', array_length(regexp_split_to_array(trim(r.name), ' '), 1)));
            v_password := v_surname || '1234';

            -- 🛡️ SAFETY NET
            IF r.email = 'parent@school.com' THEN v_password := 'parent1234'; END IF;

            INSERT INTO auth.users (
                instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                raw_app_meta_data, raw_user_meta_data, created_at, updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated', 
                r.email, 
                crypt(v_password, gen_salt('bf')),
                NOW(),
                '{"provider": "email", "providers": ["email"]}',
                jsonb_build_object('role', 'parent'),
                NOW(), NOW()
            );
            INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
            VALUES (new_id, new_id, jsonb_build_object('sub', new_id, 'email', r.email), 'email', new_id, NOW(), NOW(), NOW());
        END IF;
    END LOOP;

    -- 4. Ensure Admin Exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@school.com') THEN
         new_id := gen_random_uuid();
         INSERT INTO auth.users (
            instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
            raw_app_meta_data, raw_user_meta_data, created_at, updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated', 
            'admin@school.com', crypt('password123', gen_salt('bf')), NOW(),
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('role', 'admin'),
            NOW(), NOW()
        );
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (new_id, new_id, jsonb_build_object('sub', new_id, 'email', 'admin@school.com'), 'email', new_id, NOW(), NOW(), NOW());
    END IF;

END;
$$ LANGUAGE plpgsql;

-- 2. DANGEROUS: Clean up existing Auth Users
DELETE FROM auth.users 
WHERE email IN (SELECT email FROM students)
   OR email IN (SELECT email FROM teachers)
   OR email IN (SELECT email FROM parents);

-- 3. EXECUTE THE SYNC
SELECT sync_all_public_users_to_auth();

-- 4. VERIFY RESULTS
SELECT email, encrypted_password FROM auth.users WHERE email = 'parent@school.com';
