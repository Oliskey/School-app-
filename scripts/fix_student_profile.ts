
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key, hoping RLS allows insert or we might need service role if RLS is strict. 
// Actually, for admin tasks, service role key is better if available, but let's try with what we have in .env usually. 
// The cached .env file showed VITE_SUPABASE_ANON_KEY. If writes fail, we might need a different approach or SQL execution. 
// However, the schema file showed "ALTER TABLE students DISABLE ROW LEVEL SECURITY;", so anon key should work for now.

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStudentProfile() {
    const targetEmail = 'oliskeylee@gmail.com';
    console.log(`Checking profile for ${targetEmail}...`);

    // 1. Get User ID
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', targetEmail)
        .single();

    if (userError || !users) {
        console.error('Error finding user or user does not exist:', userError);
        return;
    }

    console.log(`Found user: ${users.name} (ID: ${users.id})`);

    // 2. Check if student profile exists
    const { data: existingStudent, error: studentCheckError } = await supabase
        .from('students')
        .select('*')
        .eq('user_id', users.id)
        .single();

    if (existingStudent) {
        console.log('Student profile already exists:', existingStudent);
        return;
    }

    console.log('Student profile missing. Creating one now...');

    // 3. Create Student Profile
    const { data: newStudent, error: createError } = await supabase
        .from('students')
        .insert({
            user_id: users.id,
            name: users.name, // Use name from user record
            email: targetEmail, // Ensure email column is populated as fetchStudentByEmail uses it
            grade: 10,
            section: 'A',
            department: 'Science',
            attendance_status: 'Present'
        })
        .select()
        .single();

    if (createError) {
        console.error('Failed to create student profile:', createError);
    } else {
        console.log('Successfully created student profile:', newStudent);
    }
}

fixStudentProfile();
