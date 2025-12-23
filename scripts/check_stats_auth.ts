
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

async function checkStatsAuth() {
    console.log('Checking database counts (Authenticated)...');

    // Login as Teacher
    await supabase.auth.signInWithPassword({
        email: 'j.adeoye@school.com',
        password: 'adeoye1234'
    });

    const tables = ['users', 'students', 'teachers', 'parents', 'auth_accounts'];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error(`❌ Error counting ${table}:`, error.message);
        } else {
            console.log(`✅ ${table}: ${count} rows`);
        }
    }
}

checkStatsAuth();
