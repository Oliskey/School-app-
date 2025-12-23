
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugAccount() {
    const targetEmail = 'oliskeylee@gmail.com';
    console.log(`Debugging account for: ${targetEmail}`);

    // 1. Check users table
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', targetEmail)
        .maybeSingle();

    if (userError) console.error('Error fetching user:', userError);
    if (user) {
        console.log('✅ Found in "users" table:', user);
    } else {
        console.log('❌ NOT found in "users" table');
    }

    // 2. Check auth_accounts table
    const { data: auth, error: authError } = await supabase
        .from('auth_accounts')
        .select('*')
        .eq('email', targetEmail)
        .maybeSingle();

    if (authError) console.error('Error fetching auth_account:', authError);
    if (auth) {
        console.log('✅ Found in "auth_accounts" table:', auth);
    } else {
        console.log('❌ NOT found in "auth_accounts" table');
    }

    // 3. Check for username collision
    const { data: usernameWait, error: usernameError } = await supabase
        .from('auth_accounts')
        .select('*')
        .like('username', '%oliskey%');

    if (usernameWait && usernameWait.length > 0) {
        console.log('Similar usernames founded in auth_accounts:', usernameWait);
    }
}

debugAccount();
