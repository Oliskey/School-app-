const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key) envVars[key.trim()] = valueParts.join('=').trim();
    });
} else {
    // try .env.example fallback
    const envExamplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(envExamplePath)) {
        const envContent = fs.readFileSync(envExamplePath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key) envVars[key.trim()] = valueParts.join('=').trim();
        });
    }
}

const supabaseUrl = envVars['VITE_SUPABASE_URL'] || process.env.VITE_SUPABASE_URL;
// Use Service Role Key if available, else Anon Key
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_ANON_KEY'] || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Checking CLASSES table (Top 20) ---');
    const { data: classes, error: cErr } = await supabase.from('classes').select('id, grade, section').limit(20);
    if (cErr) console.error(cErr);
    else console.table(classes);

    console.log('\n--- Checking TEACHER_CLASSES table (Top 20) ---');
    const { data: tClasses, error: tcErr } = await supabase.from('teacher_classes').select('id, teacher_id, class_name').limit(20);
    if (tcErr) console.error(tcErr);
    else console.table(tClasses);
}

checkData();
