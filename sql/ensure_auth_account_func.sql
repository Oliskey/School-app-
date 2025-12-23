
-- Function to manually ensure an auth account exists for a user
-- This is useful when a user is created via Reuse ID logic (skipping the insert trigger)
-- or when the trigger fails for some reason.
CREATE OR REPLACE FUNCTION ensure_auth_account(target_user_id INTEGER)
RETURNS JSONB
SECURITY DEFINER -- Runs with admin privileges to bypass RLS on auth_accounts
AS $$
DECLARE
    v_user RECORD;
    v_username VARCHAR(255);
    v_password VARCHAR(255);
    v_surname VARCHAR(255);
    v_user_type VARCHAR(50);
    v_hashed_password VARCHAR(255);
    v_auth_account_id UUID;
    v_exists BOOLEAN;
BEGIN
    -- 1. Get user details
    SELECT * INTO v_user FROM users WHERE id = target_user_id;
    
    IF v_user IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- 2. Check if auth account already exists
    SELECT EXISTS(SELECT 1 FROM auth_accounts WHERE user_id = target_user_id) INTO v_exists;
    
    IF v_exists THEN
        RETURN jsonb_build_object('success', true, 'message', 'Auth account already exists');
    END IF;

    -- 3. Prepare data (Logic copied from auto_sync_users_to_auth.sql)
    v_user_type := COALESCE(v_user.role, 'Student');
    v_surname := regexp_replace(TRIM(v_user.name), '^.* ', '');
    
    -- Generate username
    v_username := LOWER(
        SUBSTRING(v_user_type FROM 1 FOR 1) || 
        regexp_replace(LOWER(TRIM(v_user.name)), '\s+', '.', 'g')
    );
    
    -- Generate password
    v_password := LOWER(v_surname) || '1234';
    
    -- Hash password
    v_hashed_password := crypt(v_password, gen_salt('bf', 10));

    -- 4. Insert
    INSERT INTO auth_accounts (
        username,
        password,
        user_type,
        email,
        user_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        v_username,
        v_hashed_password,
        v_user_type,
        v_user.email,
        v_user.id,
        true,
        NOW(),
        NOW()
    )
    RETURNING id INTO v_auth_account_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Created auth account',
        'username', v_username,
        'id', v_auth_account_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;
