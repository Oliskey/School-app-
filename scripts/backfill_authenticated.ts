
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

async function backfillAuthenticated() {
    console.log('Attempting to login as Teacher (John Adeoye)...');

    // Try John Adeoye
    const email = 'j.adeoye@school.com';
    const password = 'adeoye1234';

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (authError) {
        console.error('Login failed:', authError.message);
        // Fallback to Oliskey Lee if John fails (since we know Oliskey exists)
        console.log('Falling back to Oliskey Lee...');
        const { data: authData2, error: authError2 } = await supabase.auth.signInWithPassword({
            email: 'oliskeylee@gmail.com',
            password: 'lee1234'
        });

        if (authError2) {
            console.error('Login failed for Oliskey too:', authError2.message);
            return;
        }
        console.log('Logged in as Oliskey Lee');
    } else {
        console.log('Logged in as John Adeoye');
    }

    // Now proceed with backfill using the authenticated client (supabase instance maintains session?)
    // Actually, createClient doesn't automatically use the session unless we set it.
    // Use the returned session to create a user-scoped client? 
    // No, standard client stores session in memory if not persisted.

    // Let's verify if we are authenticated
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current Auth User:', user?.email);

    // 1. Fetch all users
    const { data: users, error: userError } = await supabase.from('users').select('*');

    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }

    console.log(`Found ${users?.length} users. Processing...`);

    let created = 0;

    for (const u of users || []) {
        const role = u.role || 'Student';
        console.log(`Processing ${u.email} (${role})...`);

        if (role === 'Student') {
            const { data: existing } = await supabase.from('students').select('id').eq('user_id', u.id).maybeSingle();
            if (!existing) {
                const { error: insertError } = await supabase.from('students').insert({
                    user_id: u.id,
                    name: u.name,
                    grade: 10,
                    section: 'A',
                    attendance_status: 'Present'
                });
                if (insertError) console.error(`  ❌ Failed:`, insertError.message);
                else { console.log(`  ✅ Created Student profile`); created++; }
            }
        } else if (role === 'Teacher') {
            const { data: existing } = await supabase.from('teachers').select('id').eq('user_id', u.id).maybeSingle();
            if (!existing) {
                const { error: insertError } = await supabase.from('teachers').insert({
                    user_id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: 'N/A'
                });
                if (insertError) console.error(`  ❌ Failed:`, insertError.message);
                else { console.log(`  ✅ Created Teacher profile`); created++; }
            }
        } else if (role === 'Parent') {
            const { data: existing } = await supabase.from('parents').select('id').eq('user_id', u.id).maybeSingle();
            if (!existing) {
                const { error: insertError } = await supabase.from('parents').insert({
                    user_id: u.id,
                    name: u.name,
                    email: u.email,
                    phone: 'N/A'
                });
                if (insertError) console.error(`  ❌ Failed:`, insertError.message);
                else { console.log(`  ✅ Created Parent profile`); created++; }
            }
        }
    }
    console.log(`Process complete. Created: ${created}`);
}

backfillAuthenticated();
