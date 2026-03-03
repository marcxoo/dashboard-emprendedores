
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFairs() {
    const { data: fairs, error } = await supabase.from('fairs').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log(`Total fairs: ${fairs.length}`);
    if (fairs.length > 0) {
        console.log('Fairs sample:', fairs[0]);
    }
}

checkFairs();
