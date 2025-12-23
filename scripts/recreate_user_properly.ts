
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

async function recreateUser() {
    const targetEmail = 'oliskeylee@gmail.com';
    console.log(`Recreating user properly for: ${targetEmail}`);

    // 1. Fetch existing data to back it up (simplistic backup)
    const { data: user } = await supabase.from('users').select('*').eq('email', targetEmail).maybeSingle();

    if (!user) {
        console.log('User not found, nothing to delete. Proceeding to create.');
    } else {
        console.log('Found user, deleting...', user.id);
        const { error: deleteError } = await supabase.from('users').delete().eq('id', user.id);
        if (deleteError) {
            console.error('Failed to delete user:', deleteError);
            return;
        }
        console.log('User deleted.');
    }

    // 2. Create User (Triggers auth_accounts creation)
    console.log('Creating new user record...');
    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
            email: targetEmail,
            name: user?.name || 'Oliskey Lee',
            role: 'Parent',
            avatar_url: user?.avatar_url
        })
        .select()
        .single();

    if (createError) {
        console.error('Failed to create user:', createError);
        return;
    }

    console.log('User created:', newUser);

    // 3. Restore Parent Profile
    console.log('Restoring Parent profile...');
    const { error: parentError } = await supabase
        .from('parents')
        .insert({
            user_id: newUser.id,
            email: targetEmail,
            name: newUser.name,
            phone: '0123456789',
            childIds: []
        });

    if (parentError) console.error('Error creating parent:', parentError);
    else console.log('Parent profile created.');

    // 4. Verification
    // Wait a moment for trigger to run
    await new Promise(r => setTimeout(r, 2000));

    const { data: authCheck } = await supabase.from('auth_accounts').select('*').eq('user_id', newUser.id);
    console.log('Auth Account Check:', authCheck);
}

recreateUser();
