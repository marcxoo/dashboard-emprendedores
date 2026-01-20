import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listSurveys() {
    console.log('Listing all surveys...');

    const { data: surveys, error } = await supabase
        .from('custom_surveys')
        .select('*');

    if (error) {
        console.error('Error fetching surveys:', error);
        return;
    }

    console.log(`Found ${surveys.length} surveys.`);

    for (const survey of surveys) {
        const { count, error: countError } = await supabase
            .from('survey_responses')
            .select('*', { count: 'exact', head: true })
            .eq('survey_id', survey.id);

        console.log(`- [${survey.id}] "${survey.title}" (Type: ${survey.type || 'N/A'}) - Responses: ${count}`);
    }
}

listSurveys();
