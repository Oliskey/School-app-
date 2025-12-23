
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function listUsers() {
    const { data: users, error } = await supabase.from('users').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log(JSON.stringify(users, null, 2));
}

listUsers();
