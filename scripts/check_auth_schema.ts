
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


// Log available keys (masked)
Object.keys(env).forEach(k => {
    if (k.includes('KEY') || k.includes('SECRET')) {
        console.log(`Found key: ${k}`);
    }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_SERVICE_ROLE_KEY'];
const isServiceRole = !!supabaseKey;

if (!supabaseUrl) {
    console.error('Missing URL');
    process.exit(1);
}

// Fallback to anon if no service role
const keyToUse = supabaseKey || env['VITE_SUPABASE_ANON_KEY'];
console.log(`Using Service Role: ${isServiceRole}`);

const supabase = createClient(supabaseUrl, keyToUse!);


async function checkSchema() {
    console.log('Checking auth_accounts columns...');

    // Insert a dummy record that will fail but reveal context? No.
    // Select 1 row.
    const { data, error } = await supabase.from('auth_accounts').select('*').limit(1);

    if (error) {
        console.error('Error fetching auth_accounts:', error);
    } else if (data && data.length > 0) {
        console.log('Found row keys:', Object.keys(data[0]));
    } else {
        console.log('No rows found in auth_accounts. Inserting dummy to provoke error potentially?');
        // Actually, if we select * and it works, we know the columns.
        // But if table is empty, we get specific columns if we ask for them?
        // We asked for *, so result keys would be empty if no row?
        // Yes.
        // If empty, let's try to insert dummy with 'password' field and see if it fails.
        // This is safe if we use a random username.
    }
}

checkSchema();
