
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ALL 267 emails that were actually invited
const INVITED_EMAILS = `margaritaavila324@gmail.com,mv4739358@gmail.com,n4077078@gmail.com,Erikablp@hotmail.com,pincaye576@gmail.com,morenonagely@gmail.com,vmartillom2@gmail.com,jcortezo2@unemi.edu.ec,cristiperez30@yahoo.com,tatycoello1990@hotmail.com,arielsaavedra202021@gmail.com,andyinga083@gmail.com,churritosangie@hotmail.com,btorresv7@unemi.edu.ec,maria.sanchez.98@hotmail.com,pdrovalencia3@gmail.com,jachris25595@gmail.com,divinaec905@gmail.com,juanitareyes911@gmail.com,ana1970guerrero@gmail.com,geomaradiaz02@gmail.com,marjoriesalguero16@gmail.com,elopeza@hotmail.com,Jennifferescobarnvas@gmail.com,mariodavidnavassiza@gmail.com,nagely.salinas@uees.edu.ec,amora1993@gmil.com,cristinapaez2311@outlook.es,camachobertha830@gmail.com,ortizpachecoelizabethmayra@gmail.com,cedomenicka@gmail.com,magdalena_pardo@hotmail.es,marcosbriones0722@gmail.com,petilu.pp@gmail.com,danielaac183@gmail.com,florameliarivera@gmail.com,aaltamiranoc4@unemi.educ.ec,mariaelenalassa1@gmail.com,jimenezelena533@gmail.com,tucunangohelen@gmail.com,mari.cruz15@hotmail.com,teresamariduena1808@gmail.com,yuquilemaivanna@gmail.com,silveramelina65@gmail.com,elizabethrocio-cepeda@hotmail.com,analaravaldiviezo@gmail.com,beyou.joyeriaaccesorios@gmail.com,leslypinela2003@gmail.com,naranjo03allison@gmail.com,karen.michelleparedes@gmail.com,haroldgranja@hotmail.com,drosadoa@unemi.edu.ec,gematapia2002@gmail.com,jenniferjerez22@gmail.com,jgop_isl@hotmail.com,edisonwillianlemag@gmail.com,vivianaleonvl1@gmail.com,avillamarr2@unemi.edu.ec,kg0996468518@gmail.com,rociosantoscrisostomo@gmail.com,magyauqui@gmail.com,Gelusira@gmail.com,taniayumbo38@hotmail.com,nperrazop@unemi.edu.ec,ericduplaa@gmail.com,steffanyss@hotmail.com,compubayas@gmail.com,vallejojair13@gmail.com,estelamc1959@gmail.com,moransaltosf@gmail.com,mauriciogarcesm@hotmail.com,monicazm.93@gmail.com,tabataelizabeth24@gmail.com,alfijoyasecuador@gmail.com,mildre_heredia@hotmail.com,davidleonel1989@gmail.com,homa0768@hotmail.com,dixoonperez123@gmail.com,sarahynaranjoc12@hotmail.com,pandressanchez.89@gmail.com,stephjara17@gmail.com,lguamans4@unemi.edu.ec,bebelindamix@gmail.com,mamilucreaciones@gmail.com,mishell3024gonzalez@gmail.com,elisagch31@gmail.com,Olguimejia85@hotmail.com,silviapmc_acuario@hotmail.com,noemiq1966@gmail.com,miluscanogarces@gmail.com,anamaciasholguin@gmail.com,jhonnyk1028@outlook.com,johnvicentevi@gmail.com,juanajimenezlinda@live.com,maria_honorez@hotmail.com,elizabethdelgado10303030@gmail.com,bakerymuscovado@gmail.com,michelleveracalderon00@gmail.com,nilviacardenas@hotmail.com,titicitasweet@hotmail.com,carolinaochoa_1786@outlook.com,yamiperez26@gmail.com,teresamancillayanbal@gmail.com,abnarcisa@hotmail.com,postrecitosmily@gmail.com,edwin_ref01@yahoo.es,janethvallejo07@gmail.com,jenniferreyesmosquera@gmail.com,icardenasc6@unemi.edu.ec,lishye_j@hotmail.com,ayme11628@gmail.com,hectorsolorzanop2020@gmail.com,es084636@gmail.com,viviana.chuquiana@gmail.com,paovalleflores@hotmail.com,vallejojonathan450@gmail.com,vale.aleja03@gmail.com,orrellana_1965@hotmail.com,mlopezs10@unemi.edu.ec,michelleestradarosado@gmail.com,gabrielpaliz03@gmail.com,jorgegarciay23@hotmail.com,mcabsi@hotmail.com,alyjabonerianatural@outlook.es,confeccionesmary2020@hotmail.com,rosasalazar63@hotmail.com,antoniomoran1990@hotmail.com,pedromosquera675@gmail.com,tuto_alexandra@hotmail.es,gfc713@gmail.com,vjuliana228@gmail.com,crisa-2@hotmail.com,mperaltal3@unemi.edu.ec,liliansamper@outlook.com,mchequer_g@hotmail.com,piedadhoyos14@gmail.com,apilozoa@unemi.edu.ec,marialuisatorresarreaga@gmail.com,monicaavilestorres73@gmail.com,jenniferperez22@gmail.com,adrianaramosh97@gmail.com,cesar.guillin@gmail.com,castrohernan562@gmail.com,stefaniaduran@gmail.com,mayibarrionuevo@hotmail.com,hugoaviles@hotmail.com,patriciasaltos2016@gmail.com,guerra.mg49@gmail.com,aurorasarabia83@gmail.com,mariabelenarreaga1988@gmail.com,rosanacarvajal306@gmail.com,alexanderpalacios312@gmail.com,anaiior22@outlook.es,loresaa_@hotmail.com,dayananicole1101@gmail.com,mayramillan65@gmail.com,academiarene4@gmail.com,gualbertoguijarro1954@gmail.com,monikelyssa@gmail.com,shirleyillingworth08@gmil.com,jescobar16@outlook.com,melliflor.ventas@gmail.com,pinasonnia@gmail.com,ariasrosa611@gmail.com,selenatomala18@gmail.com,jennidjd20@outlook.es,esperanzaguirre85@gmail.com,alexandrabenavides971@gmail.com,jimenezjenniffer51@gmail.com,isatbcordova@gmail.com,zeussaritama113@gmail.com,marcelaronquillo79@gmail.com,angelicalarretaperez@gmail.com,ninoska_23@hotmail.com,haide443@gmail.com,yvanpalomino2020@hotmail.com,naranjov1982@gmail.com,omarlopez09@gmail.com,mlema7743@gmail.com,karenlonda97@gmail.com,mendescm13@gmail.com,popkorn_4@hotmail.com,mariabelenmartinezgarcia1@gmail.com,xavier_vallejo19@hotmail.com,marciaguamanm80@hotmail.com,adm.melainnova25@hotmail.com,xalvaradodentist@gmail.com,allison.torres.sanchez@gmail.com,fumigc@gmail.com,llerenasandra72@gmail.com,nencaladag@unemi.edu.ec,jesus_4_1985@hotmail.com,bccleaningservice23@gmail.com,lourdesmarinazarate@gmail.com,roseless.mc@gmail.com,isabellapucha16@gmail.com,leocanmlora@gmail.com,nahosegovita@gmail.com,anamarianieto01@gmail.com,jahariram@gmail.com,lorelys.rivera.moran@gmail.com,abigail27_97@hotmail.com,colcha0220@hotmail.com,stefaniacarpio1089@gmail.com,marianavera435@gmail.com,paulinagalarzap@gmail.com,morellanaa@unemi.edu.ec,johannafabiolav@gmail.com,fernandavergara7@gmail.com,pablo200sarate@gmail.com,vivi_806@hotmail.com,anapoveda64@gmail.com,denissheredia@gmail.com,majomejia2525@gmail.com,mariamora_holguin@hotmail.com,andreajarrin21@gmail.com,jhonnyvasquez1981@outlook.com,erimaree89@hotmail.com,alviarezsinais11@gmail.com,moreirapastorizan@gmail.com,patriciaelizabethmq@gmail.com,reyesloyda2020@gmail.com,dorarios883@gmail.com,ortegayaritza2000@gmail.com,ernesto2040palma@gmail.com,dominicksg@outlook.com,mauxi-bg@hotmail.com,alvarezavilio@gmail.com,silviasotot1982@gmail.com,chaulaomilagro@gmail.com,zalanis.torres1999@gmail.com,marthasuarez1046@gmail.com,maribel_moreira@hotmail.com,mechealvarado1999@gmail.com,cuencamaria728@gmail.com,globos-magicos76@gmail.com,angelinamosquera39@gmail.com,dianamoreira05@hotmail.com,veronikmontesdeocamorante@gmail.com,narcisasalinas879@gmail.com,marthapaucar1975@gmail.com,jesicapaguay83@gmail.com,mariaguirremero@gmail.com,solange18ea@gmail.com,wendygines13@gmail.com,patricia.chele1974@gmail.com,rivera.jesenia28@gmail.com,eubrja@gmail.com,andybenalcazar@gmail.com,ecevalloso@unemi.edu.ec,danielitanietoullauri@gmail.com,veritolanena41@gmail.com,jessicacorrea1515@gmail.com,paulinahermida50@gmail.com,bethbethza@gmail.com,mayragalarzarivera@gmail.com,vanessadelgadoj@gmail.com,luisanaranjoa@hotmail.com,arcekattya69@gmail.com,jessicagarciapinmo24@gmail.com,anapmendozas@gmail.com,emily_vale2010@hotmail.com,gina.nenita84@hotmail.com,jenniffermendozamoran@gmail.com,mauritorresarreaga1989@gmail.com,majosarmiento1830@gmail.com,conchi-oca@hotmail.com`.split(',').map(e => e.toLowerCase().trim()).filter(e => e.includes('@'));

async function insertInvitations() {
    console.log("=== INSERTING INVITATIONS (No cleanup) ===\n");
    console.log(`Total emails to register: ${INVITED_EMAILS.length}`);

    // Fetch entrepreneurs
    console.log("\n1. Fetching entrepreneurs...");
    const { data: entrepreneurs, error } = await supabase
        .from('entrepreneurs')
        .select('id, correo, nombre_emprendimiento');

    if (error) {
        console.error("Error:", error);
        return;
    }

    // Match emails to entrepreneurs and create logs
    console.log("\n2. Matching emails to entrepreneurs...");
    const logsToInsert = [];
    const notFound = [];

    for (const email of INVITED_EMAILS) {
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
                created_at: new Date().toISOString()
            });
        } else {
            notFound.push(email);
        }
    }

    console.log(`   Matched: ${logsToInsert.length}`);
    if (notFound.length > 0) {
        console.log(`   Not found in DB (${notFound.length}):`, notFound);
    }

    // Insert logs
    console.log("\n3. Inserting logs...");
    const batchSize = 50;
    let inserted = 0;

    for (let i = 0; i < logsToInsert.length; i += batchSize) {
        const batch = logsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
            .from('invitation_logs')
            .insert(batch);

        if (insertError) {
            console.error("Insert error:", insertError);
            return;
        }

        inserted += batch.length;
        console.log(`   Inserted: ${inserted}/${logsToInsert.length}`);
    }

    console.log(`\n✅ SUCCESS! Registered ${inserted} invitations.`);
    console.log("Refresh the dashboard to see the updated count.");
}

insertInvitations();
