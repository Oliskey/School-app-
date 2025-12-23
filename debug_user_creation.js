// debug_user_creation.js
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Env Vars. Please run with environment variables loaded.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("--- DEBUGGING USER CREATION ---");
    const emailToCheck = 'alex.doe@example.com';

    // 1. Check Parents Table
    const { data: parents, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('email', emailToCheck);

    if (parentError) console.error("Error checking parents:", parentError);
    else console.log(`found in 'parents' table: ${parents.length} records`, parents);

    // 2. Check Users Table
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', emailToCheck);

    if (userError) console.error("Error checking users:", userError);
    else console.log(`found in 'users' table: ${users.length} records`, users);

    // 3. Check Auth Accounts View
    const { data: accounts, error: accountError } = await supabase
        .from('auth_accounts')
        .select('*')
        .eq('email', emailToCheck);

    if (accountError) console.error("Error checking auth_accounts:", accountError);
    else console.log(`found in 'auth_accounts' view: ${accounts.length} records`, accounts);

    // 4. Check all Auth Accounts (limit 5) to see if view works at all
    const { data: all, error: allError } = await supabase.from('auth_accounts').select('*').limit(5);
    if (allError) console.error("Error fetching ANY auth_accounts:", allError);
    else console.log("Sample auth_accounts:", all.length > 0 ? "View is accessible" : "View returned empty");

}

debug();
