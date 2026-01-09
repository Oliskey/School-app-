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
    // fallback
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(envExamplePath)) {
        console.log('Using .env.example fallback');
        const envContent = fs.readFileSync(envExamplePath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key) envVars[key.trim()] = valueParts.join('=').trim();
        });
    }
}

const supabaseUrl = envVars['VITE_SUPABASE_URL'] || process.env.VITE_SUPABASE_URL;
// Use Service Role to bypass RLS
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Service Role credentials. Cannot apply migration safely.');
    // If lacking service role, try anon key but warn about RLS
    if (envVars['VITE_SUPABASE_ANON_KEY']) {
        console.warn("Falling back to ANON KEY. Seeding might fail due to RLS.");
    } else {
        process.exit(1);
    }
}

const clientKey = supabaseKey || envVars['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, clientKey);

async function applyMigration() {
    console.log('🚀 Applying Migration 0048: CBT RLS Fix...');

    const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '0048_fix_cbt_rls.sql');
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
        console.log(`\nFile: database/migrations/0048_fix_cbt_rls.sql`);
    } else {
        console.log('✅ Migration applied successfully via RPC!');
    }
}

applyMigration();
