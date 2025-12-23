
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_ANON_KEY!);

async function findAdmin() {
    const { data: admins } = await supabase
        .from('auth_accounts')
        .select('username, email, user_type')
        .eq('user_type', 'Admin')
        .limit(5);

    console.log('Admins found:', admins);
}

findAdmin();
