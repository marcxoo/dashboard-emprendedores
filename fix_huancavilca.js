import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const HUANCAVILCA_TRACKING = [
    { id: 'step_1', label: 'Correo confirmación Fundación Huancavilca', completed: false },
    { id: 'step_2', label: 'Correo de Reservación de espacio Bloque V', completed: false },
    { id: 'step_3', label: 'Confirmación de espacio bloque V (fundación Huancavilca)', completed: false },
    { id: 'step_4', label: 'Correo Micrófono', completed: false },
    { id: 'step_5', label: 'Correo parlante – pedestal', completed: false },
    { id: 'step_6', label: 'Cobertura a comunicación (Alfonso barrera)', completed: false }
];

async function fixMigration() {
    console.log('Starting fix...');

    // 1. Delete the duplicate I created (Name = 'MISION HUANCAVILCA')
    const { error: deleteError } = await supabase
        .from('events_2026')
        .delete()
        .eq('name', 'MISION HUANCAVILCA'); // Exact match to my previous script

    if (deleteError) console.error('Error deleting duplicate:', deleteError);
    else console.log('Deleted duplicate event "MISION HUANCAVILCA".');

    // 2. Find the REAL event (Type or Name contains 'Huancavilca')
    // Using simple OR logic by fetching both potential matches
    const { data: events, error: searchError } = await supabase
        .from('events_2026')
        .select('*')
        .or('name.ilike.%HUANCAVILCA%,type.ilike.%HUANCAVILCA%')
        .eq('status', 'active');

    if (searchError) {
        console.error('Error searching real event:', searchError);
        return;
    }

    if (!events || events.length === 0) {
        console.log('No existing event found with "Huancavilca" in name or type.');
        return;
    }

    console.log(`Found ${events.length} potential matches.`);

    // Likely the user's event
    const targetEvent = events[0];
    console.log(`Updating event: ID=${targetEvent.id}, Type=${targetEvent.type}, Name=${targetEvent.name}`);

    // 3. Update the real event
    const { error: updateError } = await supabase
        .from('events_2026')
        .update({ tracking: HUANCAVILCA_TRACKING })
        .eq('id', targetEvent.id);

    if (updateError) console.error('Error updating target event:', updateError);
    else console.log('Target event updated successfully with new tracking.');
}

fixMigration();
