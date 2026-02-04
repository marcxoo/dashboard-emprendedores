/**
 * Script para migrar emprendedores de estudiantes/egresados UNEMI desde CSV
 * Ejecutar con: node migrate_students_csv.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Error: Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
    process.exit(1);
}

console.log('🔗 Conectando a Supabase:', SUPABASE_URL);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// Función para limpiar texto con encoding problemático
function cleanText(text) {
    if (!text) return '';
    return text
        .trim()
        .replace(/\u00e1/g, 'á').replace(/\u00e9/g, 'é').replace(/\u00ed/g, 'í').replace(/\u00f3/g, 'ó').replace(/\u00fa/g, 'ú')
        .replace(/\u00c1/g, 'Á').replace(/\u00c9/g, 'É').replace(/\u00cd/g, 'Í').replace(/\u00d3/g, 'Ó').replace(/\u00da/g, 'Ú')
        .replace(/\u00f1/g, 'ñ').replace(/\u00d1/g, 'Ñ');
}

// Función para normalizar teléfono
function normalizePhone(phone) {
    if (!phone) return '';
    // Eliminar espacios y caracteres no numéricos excepto +
    let cleaned = phone.replace(/[^\d+]/g, '');
    // Si no tiene código de país y empieza con 09, agregar +593
    if (cleaned.startsWith('09') && cleaned.length === 10) {
        cleaned = '+593' + cleaned.substring(1);
    }
    return cleaned;
}

// Determinar categoría basada en la descripción
function inferCategory(description) {
    if (!description) return 'Otros';

    const desc = description.toLowerCase();

    if (desc.includes('comida') || desc.includes('aliment') || desc.includes('postre') || desc.includes('pastel') ||
        desc.includes('helado') || desc.includes('café') || desc.includes('coco') || desc.includes('fresi')) {
        return 'Comida';
    }
    if (desc.includes('ropa') || desc.includes('moda') || desc.includes('textil') || desc.includes('estampad') ||
        desc.includes('sublimad') || desc.includes('camiseta')) {
        return 'Moda / Textil';
    }
    if (desc.includes('bisutería') || desc.includes('joyer') || desc.includes('accesorio') || desc.includes('macramé') ||
        desc.includes('artesanal') || desc.includes('crochet')) {
        return 'Accesorios / Bisutería';
    }
    if (desc.includes('belleza') || desc.includes('cosmetic') || desc.includes('lash') || desc.includes('peluquer') ||
        desc.includes('cuidado personal')) {
        return 'Belleza / Cuidado Personal';
    }
    if (desc.includes('diseño') || desc.includes('gráfic') || desc.includes('digital') || desc.includes('app') ||
        desc.includes('plataforma') || desc.includes('tecnolog')) {
        return 'Tecnología / Digital';
    }
    if (desc.includes('servicio') || desc.includes('asesor') || desc.includes('consult')) {
        return 'Servicios';
    }
    if (desc.includes('vela') || desc.includes('aromaterapia') || desc.includes('recuerdo') || desc.includes('regalo')) {
        return 'Regalos / Artesanías';
    }

    return 'Otros';
}

async function migrateCSV() {
    console.log('🚀 Iniciando migración de emprendedores desde CSV...\n');

    // Leer el archivo CSV
    const csvPath = path.join(process.cwd(), 'src', 'Base_emprendedores_CON_DATOS (1).csv');

    if (!fs.existsSync(csvPath)) {
        console.error('❌ No se encontró el archivo CSV en:', csvPath);
        process.exit(1);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    // Saltar la cabecera
    const dataLines = lines.slice(1);
    console.log(`📊 Encontrados ${dataLines.length} registros en el CSV\n`);

    // Obtener emprendedores existentes para evitar duplicados (por correo)
    const { data: existingEntrepreneurs } = await supabase
        .from('entrepreneurs')
        .select('correo, persona_contacto');

    const existingEmails = new Set(
        (existingEntrepreneurs || [])
            .map(e => e.correo?.toLowerCase())
            .filter(Boolean)
    );

    console.log(`📋 Ya existen ${existingEmails.size} emprendedores en la base de datos\n`);

    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        // CSV usa punto y coma como separador
        const parts = line.split(';');

        if (parts.length < 6) {
            console.log(`⚠️  Línea ${i + 2} incompleta, saltando...`);
            skipped++;
            continue;
        }

        const [correo, nombreCompleto, cedula, celular, carrera, descripcion] = parts.map(p => p?.trim() || '');

        // Verificar si ya existe
        if (existingEmails.has(correo.toLowerCase())) {
            console.log(`⏭️  ${nombreCompleto} (${correo}) ya existe, saltando...`);
            skipped++;
            continue;
        }

        // Inferir categoría de la descripción
        const categoria = inferCategory(descripcion);

        // Crear nombre de emprendimiento basado en descripción o nombre
        const nombreEmprendimiento = descripcion
            ? (descripcion.length > 50 ? descripcion.substring(0, 50) + '...' : descripcion)
            : `Emprendimiento de ${nombreCompleto.split(' ')[0]}`;

        // Preparar datos para insertar
        const entrepreneurData = {
            nombre_emprendimiento: nombreEmprendimiento,
            persona_contacto: cleanText(nombreCompleto),
            telefono: normalizePhone(celular),
            correo: correo.toLowerCase(),
            ciudad: 'Milagro', // Por defecto UNEMI
            actividad_economica: cleanText(descripcion),
            red_social: '',
            subcategoria_interna: categoria,
            categoria_principal: categoria,
            semaforizacion: 'Estudiante / Graduado UNEMI',
            veces_en_stand: 0,
            ultima_semana_participacion: null,
            notas: JSON.stringify({
                general_notes: `Carrera: ${cleanText(carrera)}\nCédula: ${cedula}`,
                history: [],
                ruc: ''
            })
        };

        // Insertar en Supabase
        const { data, error } = await supabase
            .from('entrepreneurs')
            .insert([entrepreneurData])
            .select()
            .single();

        if (error) {
            console.error(`❌ Error insertando ${nombreCompleto}:`, error.message);
            errors++;
        } else {
            console.log(`✅ Insertado: ${nombreCompleto} - ${categoria}`);
            inserted++;
            existingEmails.add(correo.toLowerCase()); // Prevenir duplicados dentro del mismo batch
        }

        // Pequeña pausa para no sobrecargar la API
        if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📈 RESUMEN DE MIGRACIÓN');
    console.log('='.repeat(50));
    console.log(`✅ Insertados: ${inserted}`);
    console.log(`⏭️  Saltados (duplicados/incompletos): ${skipped}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📊 Total procesados: ${dataLines.length}`);
    console.log('='.repeat(50));
}

// Ejecutar
migrateCSV().catch(console.error);
