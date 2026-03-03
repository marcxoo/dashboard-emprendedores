
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read directly from .env.local
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase config");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function normalizeString(str) {
    if (!str) return '';
    return str
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\s*[-–—]\s*/g, ' - ')
        .toUpperCase();
}

async function checkNormalization() {
    const { data: entrepreneurs, error } = await supabase
        .from('entrepreneurs')
        .select('id, categoria_principal');

    if (error) {
        console.error(error);
        return;
    }

    let needsUpdate = 0;
    for (const e of entrepreneurs) {
        const normalized = normalizeString(e.categoria_principal);
        if (e.categoria_principal !== normalized) {
            needsUpdate++;
        }
    }

    console.log(`Total entrepreneurs: ${entrepreneurs.length}`);
    console.log(`Needs normalization: ${needsUpdate}`);
}

checkNormalization();
