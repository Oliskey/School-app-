
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
    console.error('URL:', supabaseUrl ? 'Found' : 'Missing');
    console.error('Key:', supabaseKey ? 'Found' : 'Missing');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCounts() {
    console.log('Checking database tables...\n');
    const tables = ['students', 'teachers', 'parents', 'users'];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`❌ Error counting ${table}:`, error.message);
        } else {
            console.log(`✓ ${table}: ${count ?? 0} rows`);
        }
    }

    console.log('\nFetching sample data from students table:');
    const { data, error } = await supabase
        .from('students')
        .select('id, name, grade, section')
        .limit(5);

    if (error) {
        console.error('Error fetching students:', error.message);
    } else {
        console.log(data && data.length > 0 ? data : 'No students found');
    }
}

checkCounts();
