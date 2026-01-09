const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.join(__dirname, '..', '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key) envVars[key.trim()] = valueParts.join('=').trim();
    });
} else {
    // fallback
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    if (fs.existsSync(envExamplePath)) {
        console.log('Using .env.example fallback');
        const envContent = fs.readFileSync(envExamplePath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key) envVars[key.trim()] = valueParts.join('=').trim();
        });
    }
}

const supabaseUrl = envVars['VITE_SUPABASE_URL'] || process.env.VITE_SUPABASE_URL;
// Use Service Role to bypass RLS during seeding
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase Service Role credentials. Cannot seed safely.');
    // If lacking service role, try anon key but warn about RLS
    if (envVars['VITE_SUPABASE_ANON_KEY']) {
        console.warn("Falling back to ANON KEY. Seeding might fail due to RLS.");
    } else {
        process.exit(1);
    }
}

const clientKey = supabaseKey || envVars['VITE_SUPABASE_ANON_KEY'];
const supabase = createClient(supabaseUrl, clientKey);

async function seedData() {
    console.log('🚀 Seeding School Data...');

    // 1. Seed Classes
    const classesToSeed = [
        { grade: 1, section: 'A' }, { grade: 2, section: 'A' }, { grade: 3, section: 'A' },
        { grade: 4, section: 'A' }, { grade: 5, section: 'A' }, { grade: 6, section: 'A' },
        { grade: 7, section: 'A' }, { grade: 8, section: 'A' }, { grade: 9, section: 'A' },
        { grade: 10, section: 'A', department: 'Science' },
        { grade: 11, section: 'A', department: 'Science' },
        { grade: 12, section: 'A', department: 'Science' }
    ];

    console.log('Checking existing classes...');
    const { data: existingClasses } = await supabase.from('classes').select('grade, section');
    const existingSet = new Set(existingClasses?.map(c => `${c.grade}-${c.section}`));

    const newClasses = classesToSeed.filter(c => !existingSet.has(`${c.grade}-${c.section}`));

    if (newClasses.length > 0) {
        console.log(`Inserting ${newClasses.length} new classes...`);
        const { error: insertError } = await supabase.from('classes').insert(newClasses);
        if (insertError) console.error('Error inserting classes:', insertError);
        else console.log('Classes inserted.');
    } else {
        console.log('Classes already exist.');
    }

    // 2. Assign Classes to Teachers (Mock Assignment)
    console.log('Assigning classes to teachers...');

    // Get all teachers
    const { data: teachers } = await supabase.from('teachers').select('id, name');

    if (!teachers || teachers.length === 0) {
        console.log('No teachers found to assign.');
        return;
    }

    // Get all classes IDs
    const { data: allClasses } = await supabase.from('classes').select('*');

    // For each teacher, assign all classes (for development convenience)
    for (const teacher of teachers) {
        console.log(`Assigning classes to ${teacher.name}...`);

        // Check existing
        const { data: existingAssigns } = await supabase
            .from('teacher_classes')
            .select('class_name')
            .eq('teacher_id', teacher.id);

        // We will insert 'Grade X - Section A' format or similar
        // Ideally we link by ID but teacher_classes schema might use name? 
        // Let's check schema assumption: useTeacherClasses.ts uses 'class_name'.
        // We will insert formatted names.

        const updates = allClasses.map(c => {
            // Simple formatter matching what hooks expect
            return {
                teacher_id: teacher.id,
                class_name: `Grade ${c.grade}${c.section}`,
                subject_id: null // Or generic
            };
        });

        // Insert if not exists (naive)
        // Better: delete all and re-insert for dev? No, destructive.
        // Just insert one if not exists.

        if (existingAssigns && existingAssigns.length === 0) {
            const { error: assignError } = await supabase.from('teacher_classes').insert(updates);
            if (assignError) console.error(`Failed to assign for ${teacher.name}:`, assignError);
            else console.log(`Assigned ${updates.length} classes to ${teacher.name}`);
        } else {
            console.log(`Teacher ${teacher.name} already has assignments.`);
        }
    }

    console.log('✅ Seeding Complete.');
}

seedData();
