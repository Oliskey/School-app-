
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

async function backfillProfiles() {
    console.log('Starting profile backfill...');

    // 1. Fetch all users
    const { data: users, error: userError } = await supabase.from('users').select('*');

    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }

    if (!users || users.length === 0) {
        console.log('No users found to backfill.');
        return;
    }

    console.log(`Found ${users.length} users. Processing...`);

    let processed = 0;
    let created = 0;

    for (const user of users) {
        processed++;
        const role = user.role || 'Student'; // Default to Student if missing

        console.log(`Processing ${user.email} (${role})...`);

        if (role === 'Student') {
            const { data: existing } = await supabase.from('students').select('id').eq('user_id', user.id).maybeSingle();
            if (!existing) {
                const { error: insertError } = await supabase.from('students').insert({
                    user_id: user.id,
                    name: user.name,
                    grade: 10,
                    section: 'A',
                    attendance_status: 'Present'
                });
                if (insertError) console.error(`  ❌ Failed to create Student profile for ${user.email}:`, insertError.message);
                else {
                    console.log(`  ✅ Created Student profile for ${user.email}`);
                    created++;
                }
            }
        } else if (role === 'Teacher') {
            const { data: existing } = await supabase.from('teachers').select('id').eq('user_id', user.id).maybeSingle();
            if (!existing) {
                const { error: insertError } = await supabase.from('teachers').insert({
                    user_id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: 'N/A'
                });
                if (insertError) console.error(`  ❌ Failed to create Teacher profile for ${user.email}:`, insertError.message);
                else {
                    console.log(`  ✅ Created Teacher profile for ${user.email}`);
                    created++;
                }
            }
        } else if (role === 'Parent') {
            const { data: existing } = await supabase.from('parents').select('id').eq('user_id', user.id).maybeSingle();
            if (!existing) {
                const { error: insertError } = await supabase.from('parents').insert({
                    user_id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: 'N/A'
                });
                if (insertError) console.error(`  ❌ Failed to create Parent profile for ${user.email}:`, insertError.message);
                else {
                    console.log(`  ✅ Created Parent profile for ${user.email}`);
                    created++;
                }
            }
        } else {
            console.log(`  ⚠️ Unknown or unhandled role: ${role}`);
        }
    }

    console.log(`Backfill complete. Processed: ${processed}, Created: ${created}`);
}

backfillProfiles();
