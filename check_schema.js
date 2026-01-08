import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
    const { data, error } = await supabase
        .from('custom_surveys')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        // Check keys of the first object
        console.log('Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'No data found (table might be empty)');
    }
}

checkSchema();
