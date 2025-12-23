-- Fix for "cannot insert into view 'auth_accounts'" error
-- This updates the trigger to use Supabase's built-in auth.users table instead

-- 1. Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_auto_create_auth_account ON users;
DROP FUNCTION IF EXISTS auto_create_auth_account();

-- 2. Create a new trigger function that creates auth.users accounts via Supabase Auth API
-- Note: This trigger will NOT create auth records automatically anymore
-- Instead, auth account creation should be handled by the application using Supabase Auth SDK

-- 3. Since we can't directly insert into auth.users from triggers (it's managed by Supabase),
-- we'll remove the automatic auth account creation from the trigger

-- Alternative: If you still want to track auth accounts in your public schema:
-- Create an actual TABLE (not view) to store auth account metadata

CREATE TABLE IF NOT EXISTS public.user_accounts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('Student', 'Teacher', 'Parent', 'Admin')),
  email VARCHAR(255),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_accounts_user_id ON public.user_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_accounts_email ON public.user_accounts(email);

-- Create trigger to auto-populate user_accounts when a user is created
CREATE OR REPLACE FUNCTION auto_create_user_account()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR(255);
    v_user_type VARCHAR(50);
BEGIN
    -- Get user type from the role field in users table
    v_user_type := COALESCE(NEW.role, 'Student');
    
    -- Generate username: first letter of user_type + name with dots
    v_username := LOWER(
        SUBSTRING(v_user_type FROM 1 FOR 1) || 
        regexp_replace(LOWER(TRIM(NEW.name)), '\s+', '.', 'g')
    );
    
    -- Check if user account already exists for this user
    IF NOT EXISTS (
        SELECT 1 FROM public.user_accounts WHERE user_id = NEW.id
    ) THEN
        -- Insert into user_accounts (our tracking table)
        INSERT INTO public.user_accounts (
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

-- Attach trigger to users table
DROP TRIGGER IF EXISTS trigger_auto_create_user_account ON users;
CREATE TRIGGER trigger_auto_create_user_account
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_user_account();

-- Update the ensure_user_account function too
CREATE OR REPLACE FUNCTION ensure_user_account(target_user_id INTEGER)
RETURNS JSONB
SECURITY DEFINER
AS $$
DECLARE
    v_user RECORD;
    v_username VARCHAR(255);
    v_user_type VARCHAR(50);
    v_account_id UUID;
    v_exists BOOLEAN;
BEGIN
    -- 1. Get user details
    SELECT * INTO v_user FROM users WHERE id = target_user_id;
    
    IF v_user IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    -- 2. Check if user account already exists
    SELECT EXISTS(SELECT 1 FROM public.user_accounts WHERE user_id = target_user_id) INTO v_exists;
    
    IF v_exists THEN
        RETURN jsonb_build_object('success', true, 'message', 'User account already exists');
    END IF;

    -- 3. Prepare data
    v_user_type := COALESCE(v_user.role, 'Student');
    
    -- Generate username
    v_username := LOWER(
        SUBSTRING(v_user_type FROM 1 FOR 1) || 
        regexp_replace(LOWER(TRIM(v_user.name)), '\s+', '.', 'g')
    );
    
    -- 4. Insert into user_accounts
    INSERT INTO public.user_accounts (
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
    RETURNING id INTO v_account_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Created user account',
        'username', v_username,
        'id', v_account_id
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql;
