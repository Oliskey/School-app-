-- Function to allow admins to delete a user from auth.users by email
-- This requires the role executing it (postgres or service_role) to have permissions, 
-- or be defined with SECURITY DEFINER and owned by a superuser/supabase_admin.

CREATE OR REPLACE FUNCTION public.delete_auth_user_by_email(email_input text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  uid uuid;
BEGIN
  -- Find the user's ID
  SELECT id INTO uid FROM auth.users WHERE email = email_input;
  
  IF uid IS NOT NULL THEN
    -- Delete the user
    DELETE FROM auth.users WHERE id = uid;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_auth_user_by_email(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_auth_user_by_email(text) TO service_role;
