import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load env vars
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
    console.log('Checking database connection...');

    // 1. Try to read from entrepreneurs
    const { data, error } = await supabase
        .from('entrepreneurs')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error reading from entrepreneurs table:', error.message);
        if (error.message.includes('row-level security')) {
            console.error('   -> RLS is preventing read access. Did you run the fix SQL script?');
        }
    } else {
        console.log('✅ Read access confirmed.');
    }

    // 2. Try to insert a dummy record
    // Logic: Use a random big integer for the ID to match the bigint type
    const testId = Math.floor(Math.random() * 1000000);

    const { error: insertError } = await supabase
        .from('entrepreneurs')
        .insert([{
            id: testId,
            nombre_emprendimiento: 'Test Connection',
            persona_contacto: 'Test',
            categoria_principal: 'Test',
            ruc: '1234567890001'
        }]);

    if (insertError) {
        console.error('❌ Error writing to entrepreneurs table:', insertError.message);
        if (insertError.message.includes('new row violates row-level security policy')) {
            console.error('   -> RLS policy is missing or preventing inserts.');
        }
        if (insertError.message.includes('column "ruc" of relation "entrepreneurs" does not exist')) {
            console.error('   -> The "ruc" column is missing. The fix SQL script adds this.');
        }
    } else {
        console.log('✅ Write access confirmed.');
        // Cleanup
        await supabase.from('entrepreneurs').delete().eq('id', testId);
        console.log('✅ Cleanup successful.');
    }
}

checkDatabase();
