/**
 * Script para exportar emprendedores a CSV
 * Ejecutar con: node export_entrepreneurs_csv.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Error: Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function exportToCSV() {
    console.log('🔗 Conectando a Supabase...');

    // Obtener todos los emprendedores
    const { data: entrepreneurs, error } = await supabase
        .from('entrepreneurs')
        .select('*')
        .order('persona_contacto', { ascending: true });

    if (error) {
        console.error('❌ Error al obtener emprendedores:', error.message);
        process.exit(1);
    }

    console.log(`✅ Encontrados ${entrepreneurs.length} emprendedores\n`);

    // Crear cabeceras del CSV
    const headers = [
        'Nombre Emprendimiento',
        'Persona Contacto',
        'Correo',
        'Teléfono',
        'Ciudad',
        'Actividad Económica',
        'Red Social',
        'Categoría',
        'Subcategoría',
        'Semaforización',
        'Veces en Stand',
        'Última Participación'
    ];

    // Crear filas
    const rows = entrepreneurs.map(e => [
        e.nombre_emprendimiento || '',
        e.persona_contacto || '',
        e.correo || '',
        e.telefono || '',
        e.ciudad || '',
        e.actividad_economica || '',
        e.red_social || '',
        e.categoria_principal || '',
        e.subcategoria_interna || '',
        e.semaforizacion || '',
        e.veces_en_stand || 0,
        e.ultima_semana_participacion || ''
    ]);

    // Función para escapar valores CSV
    const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Construir el CSV
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    // Guardar el archivo
    const outputPath = './emprendedores_export.csv';
    fs.writeFileSync(outputPath, csvContent, 'utf-8');

    console.log(`📁 Archivo exportado: ${outputPath}`);
    console.log(`📊 Total de registros: ${entrepreneurs.length}`);

    // Mostrar estadísticas de correos
    const withEmail = entrepreneurs.filter(e => e.correo && e.correo.trim());
    console.log(`📧 Con correo: ${withEmail.length}`);
    console.log(`❌ Sin correo: ${entrepreneurs.length - withEmail.length}`);
}

exportToCSV().catch(console.error);
