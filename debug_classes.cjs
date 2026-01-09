
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('--- Checking CLASSES table ---');
    const { data: classes, error: cErr } = await supabase.from('classes').select('*');
    if (cErr) console.error(cErr);
    else console.table(classes);

    console.log('\n--- Checking TEACHER_CLASSES table ---');
    const { data: tClasses, error: tcErr } = await supabase.from('teacher_classes').select('*');
    if (tcErr) console.error(tcErr);
    else console.table(tClasses);
}

checkData();
