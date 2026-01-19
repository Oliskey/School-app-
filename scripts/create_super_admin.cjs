
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ikowlorheeyrsbgvlhvg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_S5WNwSeUp08bViY2qiGo6g_74f3xfvl';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createSuperAdmin() {
    const email = 'oliskeylee@gmail.com';
    const password = 'Olamide2001$';

    console.log(`Starting registration for ${email}...`);

    // 1. Sign Up User (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: 'Oliskey Lee',
                role: 'SuperAdmin'
            }
        }
    });

    if (authError) {
        console.error("Auth Sign Up Error:", authError.message);
        // Process might continue if user already exists but we want to ensure profile exists
    } else {
        console.log("Auth User Created:", authData.user?.id);
    }

    // Login to get session for RLS if needed, or use service role key if available (we only have anon key here)
    // However, if we just signed up, we might have a session.
    // But verify if we need to insert into 'users' or 'profiles' table manually if the trigger didn't fire or if we want to ensure data.

    const { data: sessionData } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (sessionData.session) {
        console.log("Logged in successfully. Updating profile...");

        const userId = sessionData.user.id;

        // 2. Insert into 'users' table (Legacy/Central)
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                email: email,
                name: 'Oliskey Lee',
                role: 'SuperAdmin',
                avatar_url: `https://ui-avatars.com/api/?name=Oliskey+Lee`
            }, { onConflict: 'email' });

        if (userError) console.error("Error upserting to users table:", userError.message);
        else console.log("Users table updated.");

        // 3. Update 'profiles' table (role)
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                role: 'superadmin',
                full_name: 'Oliskey Lee'
            })
            .eq('id', userId);

        if (profileError) console.error("Error updating profiles table:", profileError.message);
        else console.log("Profiles table updated.");

    } else {
        console.error("Could not log in to update profile. User might need email verification or password mismatch.");
    }
}

createSuperAdmin();
