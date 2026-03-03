import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSurveyResponses() {
    console.log('Checking survey responses...');

    const { data: responses, error } = await supabase
        .from('survey_responses')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error fetching responses:', error);
        return;
    }

    if (!responses || responses.length === 0) {
        console.log('No responses found.');
        return;
    }

    console.log('Found', responses.length, 'responses.');
    responses.forEach((r, i) => {
        console.log(`\n--- Response ${i + 1} ---`);
        console.log('ID:', r.id);
        console.log('Survey ID:', r.survey_id);
        console.log('Answers (JSON):', JSON.stringify(r.answers, null, 2));
    });
}

checkSurveyResponses();
