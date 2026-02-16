
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno desde el archivo .env en la raíz
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Error: Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function exportFullData() {
    console.log('🔗 Conectando a Supabase...');

    try {
        // 1. Obtener Emprendedores
        console.log('📥 Obteniendo Emprendedores...');
        const { data: entrepreneurs, error: empError } = await supabase
            .from('entrepreneurs')
            .select('*')
            .order('id', { ascending: true });

        if (empError) throw empError;
        console.log(`✅ ${entrepreneurs.length} emprendedores encontrados.`);

        // 2. Obtener Asignaciones (Ferias Estándar - Historial Semanal)
        console.log('📥 Obteniendo Asignaciones (Ferias Estándar)...');
        const { data: assignments, error: assignError } = await supabase
            .from('assignments')
            .select('*'); // Traemos todo para filtrar en memoria si es necesario

        if (assignError) throw assignError;
        console.log(`✅ ${assignments.length} asignaciones encontradas.`);

        // 3. Obtener Ferias del Portal (Nuevas Ferias)
        console.log('📥 Obteniendo Datos de Ferias del Portal...');
        const { data: fairs, error: fairsError } = await supabase.from('fairs').select('*');
        const { data: fairAssignments, error: faError } = await supabase.from('fair_assignments').select('*');
        const { data: fairSales, error: fsError } = await supabase.from('fair_sales').select('*');

        if (fairsError) throw fairsError;
        if (faError) throw faError; // fairAssignments table might not exist if unused
        if (fsError) throw fsError; // fairSales table might not exist if unused

        console.log(`✅ ${fairs.length} ferias, ${fairAssignments ? fairAssignments.length : 0} participantes, ${fairSales ? fairSales.length : 0} registros de ventas.`);

        // 4. Obtener Formularios (Encuestas)
        console.log('📥 Obteniendo Datos de Formularios...');
        const { data: surveys, error: survError } = await supabase.from('custom_surveys').select('*');
        const { data: responses, error: respError } = await supabase.from('survey_responses').select('*');

        if (survError) throw survError;
        if (respError) throw respError;
        console.log(`✅ ${surveys.length} formularios, ${responses.length} respuestas.`);

        // --- PROCESAMIENTO Y CRUCE DE DATOS ---
        console.log('🔄 Procesando y unificando datos...');

        const rows = entrepreneurs.map(emp => {
            // A. Datos Básicos
            const baseData = {
                ID: emp.id,
                Propietario: emp.persona_contacto || '',
                Emprendimiento: emp.nombre_emprendimiento || '',
                Telefono: emp.telefono || '',
                Correo: emp.correo || '',
                Ciudad: emp.ciudad || '',
                Categoria: emp.categoria_principal || '',
                Subcategoria: emp.subcategoria_interna || '',
                Actividad: emp.actividad_economica || '',
                Red_Social: emp.red_social || '',
                RUC: emp.ruc || '',
                Semaforo: emp.semaforizacion || '',
                Notas: emp.notas || ''
            };

            // B. Ferias Estándar (Assignments)
            const empAssignments = assignments ? assignments.filter(a => String(a.id_emprendedor) === String(emp.id)) : [];
            const totalStandardFairs = empAssignments.filter(a => a.asistio === true).length;
            const lastStandardFair = empAssignments.length > 0
                ? empAssignments.sort((a, b) => (b.semana || '').localeCompare(a.semana || ''))[0].semana
                : 'N/A';

            // C. Ferias del Portal (Fair Assignments)
            const empFairAssignments = fairAssignments ? fairAssignments.filter(fa => String(fa.entrepreneur_id) === String(emp.id)) : [];
            const empFairSales = fairSales ? fairSales.filter(fs => String(fs.entrepreneur_id) === String(emp.id)) : [];

            const totalPortalFairs = empFairAssignments.length;
            const totalSalesAmount = empFairSales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);

            // Lista de nombres de ferias
            const fairNames = empFairAssignments.map(fa => {
                const fair = fairs.find(f => f.id === fa.fair_id);
                return fair ? fair.name : 'Feria Desconocida';
            }).join('; ');

            // Detalle de ventas por feria
            const salesDetails = [];
            if (empFairSales.length > 0) {
                empFairAssignments.forEach(fa => {
                    const fair = fairs.find(f => f.id === fa.fair_id);
                    const salesInFair = empFairSales.filter(s => s.fair_id === fa.fair_id);
                    const total = salesInFair.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
                    if (total > 0) {
                        salesDetails.push({
                            feria: fair ? fair.name : 'Unknown',
                            monto: total
                        });
                    }
                });
            }

            // D. Formularios (Surveys)
            const empResponses = responses ? responses.filter(r => String(r.entrepreneur_id) === String(emp.id)) : [];
            const totalForms = empResponses.length;

            // Lista de formularios
            const answeredSurveys = empResponses.map(r => {
                const survey = surveys.find(s => s.id === r.survey_id);
                return survey ? survey.title : 'Survey Desconocido';
            }).join('; ');

            // Detalle de respuestas
            const responseDetails = empResponses.map(r => {
                const survey = surveys.find(s => s.id === r.survey_id);
                return {
                    encuesta: survey ? survey.title : 'Unknown',
                    fecha: r.created_at,
                    respuestas: r.answers
                };
            });

            return {
                ...baseData,
                Total_Ferias_Estandar: totalStandardFairs,
                Ultima_Feria_Estandar: lastStandardFair,
                Total_Ferias_Portal: totalPortalFairs,
                Total_Ventas_Reportadas: totalSalesAmount.toFixed(2),
                Lista_Ferias_Portal: fairNames,
                Detalle_Ventas_JSON: JSON.stringify(salesDetails),
                Total_Formularios_Respondidos: totalForms,
                Lista_Formularios: answeredSurveys,
                Detalle_Respuestas_JSON: JSON.stringify(responseDetails)
            };
        });

        // 5. Generar CSV
        console.log('💾 Generando archivo CSV...');

        // Obtener headers dinámicamente o fijos
        const headers = [
            'ID', 'Propietario', 'Emprendimiento', 'Telefono', 'Correo', 'Ciudad',
            'Categoria', 'Subcategoria', 'Actividad', 'Red_Social', 'RUC', 'Semaforo', 'Notas',
            'Total_Ferias_Estandar', 'Ultima_Feria_Estandar',
            'Total_Ferias_Portal', 'Total_Ventas_Reportadas', 'Lista_Ferias_Portal', 'Detalle_Ventas_JSON',
            'Total_Formularios_Respondidos', 'Lista_Formularios', 'Detalle_Respuestas_JSON'
        ];

        const escapeCSV = (value) => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            // Si contiene comas o comillas, envolver y escapar
            if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvString = [
            headers.join(','),
            ...rows.map(row => headers.map(header => escapeCSV(row[header])).join(','))
        ].join('\n');

        const outputPath = path.resolve(__dirname, '../data_completa_emprendedores.csv');
        fs.writeFileSync(outputPath, csvString, 'utf-8');

        console.log(`✅ Archivo exportado: ${outputPath}`);

    } catch (error) {
        console.error('❌ Error fatal:', error);
    }
}

exportFullData();
