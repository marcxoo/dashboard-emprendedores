import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    // Check column type for 'tracking' in 'events_2026'
    // Since we can't query information_schema directly with anon key usually (unless configured)
    // We will try to fetch one row and see the shape of the data.

    // First, try to insert a dummy row with JSON array data to see if it accepts it, or just fetch.
    const { data, error } = await supabase
        .from('events_2026')
        .select('tracking')
        .limit(1);

    if (error) {
        console.error('Error fetching data:', error);
    } else {
        console.log('Sample data from tracking column:', JSON.stringify(data, null, 2));
        if (data.length > 0) {
            console.log('Type of tracking value:', typeof data[0].tracking);
        }
    }
}

checkSchema();
