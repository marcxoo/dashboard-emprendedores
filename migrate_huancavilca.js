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

async function migrate() {
    console.log('Starting migration...');

    // 1. Find the event
    const { data: events, error: searchError } = await supabase
        .from('events_2026')
        .select('*')
        .ilike('name', '%HUANCAVILCA%');

    if (searchError) {
        console.error('Error searching event:', searchError);
        return;
    }

    if (!events || events.length === 0) {
        console.log('Event "MISION HUANCAVILCA" not found. Creating it...');

        const newEvent = {
            name: 'MISION HUANCAVILCA',
            date: '2026-01-14',
            month: 'ENERO',
            type: 'Otro', // Or appropriate type
            scope: 'Interno', // Default
            location: 'Bloque V', // Inferred from requirements
            responsibles: [],
            tracking: HUANCAVILCA_TRACKING,
            status: 'active'
        };

        const { error: insertError } = await supabase
            .from('events_2026')
            .insert([newEvent]);

        if (insertError) console.error('Error creating event:', insertError);
        else console.log('Event created successfully.');

    } else {
        const event = events[0];
        console.log(`Found event: ${event.name} (${event.id})`);

        // 2. Update tracking
        const { error: updateError } = await supabase
            .from('events_2026')
            .update({ tracking: HUANCAVILCA_TRACKING })
            .eq('id', event.id);

        if (updateError) console.error('Error updating event:', updateError);
        else console.log('Event tracking updated successfully.');
    }
}

migrate();
