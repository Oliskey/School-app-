
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkCounts() {
    console.log("Checking database counts...");

    const { count: usersCount, error: usersError } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (usersError) console.error("Error fetching users:", usersError);
    console.log(`Total Users (in 'users' table): ${usersCount}`);

    const { count: studentsCount, error: studentsError } = await supabase.from('students').select('*', { count: 'exact', head: true });
    if (studentsError) console.error("Error fetching students:", studentsError);
    console.log(`Total Students: ${studentsCount}`);

    const { count: teachersCount, error: teachersError } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
    if (teachersError) console.error("Error fetching teachers:", teachersError);
    console.log(`Total Teachers: ${teachersCount}`);

    const { count: parentsCount, error: parentsError } = await supabase.from('parents').select('*', { count: 'exact', head: true });
    if (parentsError) console.error("Error fetching parents:", parentsError);
    console.log(`Total Parents: ${parentsCount}`);
}

checkCounts();
