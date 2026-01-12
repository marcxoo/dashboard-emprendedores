
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// The 60 emails already invited on Jan 8
const ALREADY_INVITED = [
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

async function getUninvitedEmails() {
    console.log("=== EXTRACTING UNINVITED EMAILS ===\n");

    const { data: entrepreneurs, error } = await supabase
        .from('entrepreneurs')
        .select('id, correo, nombre_emprendimiento');

    if (error) {
        console.error("Error:", error);
        return;
    }

    // Filter: has valid email AND not in already invited list
    const uninvited = entrepreneurs.filter(e => {
        if (!e.correo || !e.correo.includes('@')) return false;
        const email = e.correo.toLowerCase().trim();
        return !ALREADY_INVITED.includes(email);
    });

    const emails = uninvited.map(e => e.correo.trim());

    console.log(`Total entrepreneurs: ${entrepreneurs.length}`);
    console.log(`Already invited: ${ALREADY_INVITED.length}`);
    console.log(`Uninvited with valid email: ${emails.length}`);
    console.log("\n=== EMAILS TO INVITE ===\n");
    console.log(emails.join(',\n'));
    console.log("\n=== COPY THE ABOVE LIST ===");
}

getUninvitedEmails();
