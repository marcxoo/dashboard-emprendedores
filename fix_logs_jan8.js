
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// The 60 valid emails that were sent on January 8th
const VALID_EMAILS = [
    "margaritaavila324@gmail.com",
    "mv4739358@gmail.com",
    "n4077078@gmail.com",
    "Erikablp@hotmail.com",
    "pincaye576@gmail.com",
    "morenonagely@gmail.com",
    "vmartillom2@gmail.com",
    "jcortezo2@unemi.edu.ec",
    "cristiperez30@yahoo.com",
    "tatycoello1990@hotmail.com",
    "arielsaavedra202021@gmail.com",
    "andyinga083@gmail.com",
    "churritosangie@hotmail.com",
    "btorresv7@unemi.edu.ec",
    "maria.sanchez.98@hotmail.com",
    "pdrovalencia3@gmail.com",
    "jachris25595@gmail.com",
    "divinaec905@gmail.com",
    "juanitareyes911@gmail.com",
    "ana1970guerrero@gmail.com",
    "geomaradiaz02@gmail.com",
    "marjoriesalguero16@gmail.com",
    "elopeza@hotmail.com",
    "Jennifferescobarnvas@gmail.com",
    "mariodavidnavassiza@gmail.com",
    "nagely.salinas@uees.edu.ec",
    "amora1993@gmil.com",
    "cristinapaez2311@outlook.es",
    "camachobertha830@gmail.com",
    "ortizpachecoelizabethmayra@gmail.com",
    "cedomenicka@gmail.com",
    "magdalena_pardo@hotmail.es",
    "marcosbriones0722@gmail.com",
    "petilu.pp@gmail.com",
    "danielaac183@gmail.com",
    "florameliarivera@gmail.com",
    "aaltamiranoc4@unemi.educ.ec",
    "mariaelenalassa1@gmail.com",
    "jimenezelena533@gmail.com",
    "tucunangohelen@gmail.com",
    "mari.cruz15@hotmail.com",
    "teresamariduena1808@gmail.com",
    "yuquilemaivanna@gmail.com",
    "silveramelina65@gmail.com",
    "elizabethrocio-cepeda@hotmail.com",
    "analaravaldiviezo@gmail.com",
    "beyou.joyeriaaccesorios@gmail.com",
    "leslypinela2003@gmail.com",
    "naranjo03allison@gmail.com",
    "karen.michelleparedes@gmail.com",
    "haroldgranja@hotmail.com",
    "drosadoa@unemi.edu.ec",
    "gematapia2002@gmail.com",
    "jenniferjerez22@gmail.com",
    "jgop_isl@hotmail.com",
    "edisonwillianlemag@gmail.com",
    "vivianaleonvl1@gmail.com",
    "avillamarr2@unemi.edu.ec",
    "kg0996468518@gmail.com",
    "rociosantoscrisostomo@gmail.com"
].map(e => e.toLowerCase().trim());

async function fixLogs() {
    console.log("=== FIXING INVITATION LOGS ===");
    console.log(`Valid emails to process: ${VALID_EMAILS.length}`);

    // 1. Fetch all entrepreneurs to match emails to IDs
    console.log("\n1. Fetching entrepreneurs...");
    const { data: entrepreneurs, error: empError } = await supabase
        .from('entrepreneurs')
        .select('id, correo, nombre_emprendimiento');

    if (empError) {
        console.error("Error fetching entrepreneurs:", empError);
        return;
    }

    console.log(`   Found ${entrepreneurs.length} entrepreneurs`);

    // 2. Match valid emails to entrepreneur IDs
    const logsToInsert = [];
    const notFound = [];

    for (const email of VALID_EMAILS) {
        const entrepreneur = entrepreneurs.find(e =>
            e.correo && e.correo.toLowerCase().trim() === email
        );

        if (entrepreneur) {
            logsToInsert.push({
                entrepreneur_id: entrepreneur.id,
                entrepreneur_name: entrepreneur.nombre_emprendimiento || 'Emprendedor',
                channel: 'bulk_email',
                template: 'taller_rentabilidad',
                status: 'sent',
                created_at: '2026-01-08T10:00:00.000Z' // The ACTUAL send date
            });
        } else {
            notFound.push(email);
        }
    }

    console.log(`\n2. Matched ${logsToInsert.length} entrepreneurs`);
    if (notFound.length > 0) {
        console.log(`   NOT FOUND (${notFound.length}):`, notFound);
    }

    // 3. Insert the logs
    if (logsToInsert.length === 0) {
        console.log("\n❌ No logs to insert!");
        return;
    }

    console.log(`\n3. Inserting ${logsToInsert.length} logs with date 2026-01-08...`);

    const { data: inserted, error: insertError } = await supabase
        .from('invitation_logs')
        .insert(logsToInsert);

    if (insertError) {
        console.error("Error inserting logs:", insertError);
        return;
    }

    console.log("\n✅ SUCCESS! Inserted logs for the 60 valid entrepreneurs.");
    console.log("   Refresh the dashboard to see the updated count.");
}

fixLogs();
