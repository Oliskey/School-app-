-- Fix for "column 'password' does not exist" AND "column 'updated_at' does not exist" error
-- This script updates the trigger and helper function to insert ONLY into columns that exist in the live View/Table.

-- 1. Update the Trigger Function to remove 'password', 'created_at', 'updated_at' columns
CREATE OR REPLACE FUNCTION auto_create_auth_account()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR(255);
    v_surname VARCHAR(255);
    v_user_type VARCHAR(50);
BEGIN
    -- Get user type from the role field in users table
    v_user_type := COALESCE(NEW.role, 'Student');
    
    -- Extract surname (last word in name)
    v_surname := regexp_replace(TRIM(NEW.name), '^.* ', '');
    
    -- Generate username: first letter of user_type + name with dots
    v_username := LOWER(
        SUBSTRING(v_user_type FROM 1 FOR 1) || 
        regexp_replace(LOWER(TRIM(NEW.name)), '\s+', '.', 'g')
    );
    
    -- Check if auth account already exists for this user
    IF NOT EXISTS (
        SELECT 1 FROM auth_accounts WHERE user_id = NEW.id
    ) THEN
        -- Insert into auth_accounts (Minimal columns)
        INSERT INTO auth_accounts (
            username,
            user_type,
            email,
            user_id,
            is_active
        ) VALUES (
            v_username,
            v_user_type,
            NEW.email,
            NEW.id,
            true
        )
        ON CONFLICT (username) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- 2. Update the Manual Ensure Function too
CREATE OR REPLACE FUNCTION ensure_auth_account(target_user_id INTEGER)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_username VARCHAR(255);
    v_surname VARCHAR(255);
    v_user_type VARCHAR(50);
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

    -- 3. Prepare data
    v_user_type := COALESCE(v_user.role, 'Student');
    v_surname := regexp_replace(TRIM(v_user.name), '^.* ', '');
    
    -- Generate username
    v_username := LOWER(
        SUBSTRING(v_user_type FROM 1 FOR 1) || 
        regexp_replace(LOWER(TRIM(v_user.name)), '\s+', '.', 'g')
    );
    
    -- 4. Insert (Minimal columns)
    INSERT INTO auth_accounts (
        username,
        user_type,
        email,
        user_id,
        is_active
    ) VALUES (
        v_username,
        v_user_type,
        v_user.email,
        v_user.id,
        true
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
