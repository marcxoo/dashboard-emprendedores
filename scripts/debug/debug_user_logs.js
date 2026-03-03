
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserLogs() {
    console.log("Checking logs for 'margaritaavila324@gmail.com' (first in allowed list)...");

    // First get the ID for this email if possible, or just search logs by entrepreneur_name if we don't have the ID handy easily without fetching entrepreneurs first.
    // Actually, I'll fetch *all* logs and filter in JS to be safe and fast.

    const { data: logs, error } = await supabase
        .from('invitation_logs')
        .select('*');

    if (error) {
        console.error(error);
        return;
    }

    const targetEmail = "margaritaavila324@gmail.com";
    // I need to map IDs to emails. I don't have the entrepreneurs list here easily without fetching it.
    // Let's first just fetch entrepreneurs to get the ID.
    const { data: entrepreneurs } = await supabase.from('entrepreneurs').select('id, correo');
    const targetEnt = entrepreneurs.find(e => e.correo === targetEmail);

    if (!targetEnt) {
        console.log("Entrepreneur not found: " + targetEmail);
        return;
    }

    console.log(`Found Entrepreneur ID: ${targetEnt.id}`);

    const userLogs = logs.filter(l => l.entrepreneur_id === targetEnt.id);
    console.log(`Total Logs for this user: ${userLogs.length}`);
    userLogs.forEach(l => {
        console.log(` - ${l.created_at} | ${l.channel} | ${l.template} | ${l.status}`);
    });
}

checkUserLogs();
