const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '..', '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key) envVars[key.trim()] = valueParts.join('=').trim();
    });
} else {
    // Fallback to .env.example
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(envExamplePath)) {
        console.log('⚠️ .env not found, using .env.example (variables might be placeholders)');
        const envContent = fs.readFileSync(envExamplePath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key) envVars[key.trim()] = valueParts.join('=').trim();
        });
    }
}

const supabaseUrl = envVars['VITE_SUPABASE_URL'] || envVars['SUPABASE_URL'] || process.env.VITE_SUPABASE_URL;
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Service Role credentials. Please insure SUPABASE_SERVICE_ROLE_KEY is in .env');
    // Try to proceed with Anon key but warn
    // process.exit(1); 
}

const clientKey = supabaseKey || envVars['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, clientKey);

async function applyMigration() {
    console.log('🚀 Applying Migration 0047: Chat Schema Fix...');

    const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '0047_chat_schema_fix.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('Migration file not found!');
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Attempt 1: RPC exec_sql
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('❌ Failed to run via RPC:', error.message);
        console.log('\n⚠️  You must run this migration manually in the Supabase SQL Editor.');
        console.log(`\nFile: database/migrations/0047_chat_schema_fix.sql`);
    } else {
        console.log('✅ Migration applied successfully via RPC!');
    }
}

applyMigration();
