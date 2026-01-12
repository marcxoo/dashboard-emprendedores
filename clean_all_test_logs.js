
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanAllTestLogs() {
    console.log("=== AGGRESSIVE CLEANUP: Jan 12 Test Logs ===\n");

    let totalDeleted = 0;
    let iteration = 0;

    while (true) {
        iteration++;

        // Fetch batch of logs to delete
        const { data: logs, error: fetchError } = await supabase
            .from('invitation_logs')
            .select('id')
            .gte('created_at', '2026-01-12T00:00:00')
            .lt('created_at', '2026-01-13T00:00:00')
            .limit(500);

        if (fetchError) {
            console.error("Fetch error:", fetchError);
            break;
        }

        if (!logs || logs.length === 0) {
            console.log("\n🎉 ALL TEST LOGS DELETED!");
            break;
        }

        console.log(`Iteration ${iteration}: Deleting ${logs.length} logs...`);

        const ids = logs.map(l => l.id);
        const { error: deleteError } = await supabase
            .from('invitation_logs')
            .delete()
            .in('id', ids);

        if (deleteError) {
            console.error("Delete error:", deleteError);
            break;
        }

        totalDeleted += logs.length;
        console.log(`   Total deleted so far: ${totalDeleted}`);
    }

    console.log(`\n=== FINAL RESULT ===`);
    console.log(`Total test logs deleted: ${totalDeleted}`);

    // Final count
    const { data: remaining } = await supabase
        .from('invitation_logs')
        .select('id, created_at');

    console.log(`Remaining logs in database: ${remaining?.length || 0}`);
}

cleanAllTestLogs();
