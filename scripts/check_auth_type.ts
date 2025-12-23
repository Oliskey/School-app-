
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuthAccountsType() {
    console.log('Checking if auth_accounts is a table or view...\n');

    // Try to query pg_catalog to determine if it's a table or view
    const { data, error } = await supabase.rpc('exec_sql', {
        query: `
            SELECT 
                table_name,
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'auth_accounts';
        `
    });

    if (error) {
        console.log('RPC not available, trying direct query...');
        // Try to insert a test row to see what happens
        const { error: insertError } = await supabase
            .from('auth_accounts')
            .insert({
                username: 'test_check_' + Date.now(),
                user_type: 'Student',
                email: 'test@test.com',
                user_id: 999999,
                is_active: true
            });

        if (insertError) {
            console.log('Insert error:', insertError.message);
            if (insertError.message.includes('view')) {
                console.log('\n❌ CONFIRMED: auth_accounts is a VIEW, not a table!');
            }
        } else {
            console.log('✓ Successfully inserted - auth_accounts is a table');
            // Clean up test row
            await supabase.from('auth_accounts').delete().eq('username', 'test_check_' + Date.now());
        }
    } else {
        console.log('Result:', data);
    }
}

checkAuthAccountsType();
