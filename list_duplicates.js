import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDupes() {
    const { data, error } = await supabase
        .from('events_2026')
        .select('id, name, tracking')
        .ilike('name', '%HUANCAVILCA%');

    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

checkDupes();
