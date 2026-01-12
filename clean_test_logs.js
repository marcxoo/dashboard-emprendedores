
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanTestLogs() {
    console.log("=== CLEANING TEST LOGS (Jan 12) ===\n");

    // 1. Count logs to delete
    const { data: allLogs, error: countError } = await supabase
        .from('invitation_logs')
        .select('id, created_at')
        .gte('created_at', '2026-01-12T00:00:00')
        .lt('created_at', '2026-01-13T00:00:00');

    if (countError) {
        console.error("Error counting logs:", countError);
        return;
    }

    console.log(`Found ${allLogs.length} test logs from Jan 12 to delete.\n`);

    if (allLogs.length === 0) {
        console.log("No logs to delete!");
        return;
    }

    // 2. Delete in batches
    const batchSize = 50;
    let deleted = 0;

    for (let i = 0; i < allLogs.length; i += batchSize) {
        const batch = allLogs.slice(i, i + batchSize);
        const ids = batch.map(l => l.id);

        const { error: deleteError } = await supabase
            .from('invitation_logs')
            .delete()
            .in('id', ids);

        if (deleteError) {
            console.error(`Error deleting batch ${i / batchSize + 1}:`, deleteError);
            console.log("\n⚠️  RLS might be blocking deletion. You may need to:");
            console.log("   1. Go to Supabase Dashboard → Table Editor → invitation_logs");
            console.log("   2. Manually delete rows where created_at contains '2026-01-12'");
            console.log("   OR add a DELETE policy for this table.");
            return;
        }

        deleted += ids.length;
        console.log(`Deleted batch ${Math.floor(i / batchSize) + 1}: ${deleted}/${allLogs.length}`);
    }

    console.log(`\n✅ SUCCESS! Deleted ${deleted} test logs.`);
    console.log("Refresh the dashboard to confirm.");
}

cleanTestLogs();
