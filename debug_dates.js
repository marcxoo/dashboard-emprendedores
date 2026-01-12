
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDates() {
    console.log("Fetching logs to check timestamps...");

    const { data: logs, error } = await supabase
        .from('invitation_logs')
        .select('created_at, channel');

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total Logs: ${logs.length}`);

    // Group by Date text (first 10 chars)
    const counts = {};
    logs.forEach(l => {
        const dateStr = l.created_at.substring(0, 10);
        if (!counts[dateStr]) counts[dateStr] = 0;
        counts[dateStr]++;
    });

    console.log("--- LOG COUNTS BY DATE ---");
    console.table(counts);

    // Show a sample of Jan 8 and Jan 12
    console.log("\n--- SAMPLES ---");
    const jan8 = logs.find(l => l.created_at.startsWith('2026-01-08'));
    const jan12 = logs.find(l => l.created_at.startsWith('2026-01-12'));

    console.log("Jan 8 Sample:", jan8 ? `${jan8.created_at} (${jan8.channel})` : "None");
    console.log("Jan 12 Sample:", jan12 ? `${jan12.created_at} (${jan12.channel})` : "None");
}

checkDates();
