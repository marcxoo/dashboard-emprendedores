/**
 * Script de sincronización: Supabase → PostgreSQL Local
 * Ejecutar con: node sync_to_local.js
 * 
 * Este script descarga todos los datos de Supabase y los guarda en tu PostgreSQL local
 * como backup de seguridad.
 */

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// === Configuración Supabase ===
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Faltan variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === Configuración PostgreSQL Local ===
const localPool = new pg.Pool({
    host: process.env.LOCAL_PG_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_PG_PORT || '5432'),
    database: process.env.LOCAL_PG_DATABASE || 'emprendedores',
    user: process.env.LOCAL_PG_USER || 'postgres',
    password: process.env.LOCAL_PG_PASSWORD || '123456'
});

// === Funciones de Sincronización ===

async function syncEntrepreneurs() {
    console.log('\n📥 Sincronizando emprendedores...');

    const { data, error } = await supabase
        .from('entrepreneurs')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('❌ Error obteniendo emprendedores de Supabase:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay emprendedores en Supabase');
        return 0;
    }

    // Limpiar tabla local y reinsertar (backup completo)
    await localPool.query('DELETE FROM entrepreneurs');

    let inserted = 0;
    for (const e of data) {
        try {
            await localPool.query(`
                INSERT INTO entrepreneurs (
                    id, created_at, nombre_emprendimiento, persona_contacto, telefono,
                    correo, ciudad, actividad_economica, red_social, subcategoria_interna,
                    categoria_principal, semaforizacion, veces_en_stand, 
                    ultima_semana_participacion, ruc, notas
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
            `, [
                e.id, e.created_at, e.nombre_emprendimiento, e.persona_contacto, e.telefono,
                e.correo, e.ciudad, e.actividad_economica, e.red_social, e.subcategoria_interna,
                e.categoria_principal, e.semaforizacion, e.veces_en_stand,
                e.ultima_semana_participacion, e.ruc, e.notas
            ]);
            inserted++;
        } catch (err) {
            console.error(`   ⚠️ Error insertando ID ${e.id}:`, err.message);
        }
    }

    console.log(`   ✅ ${inserted}/${data.length} emprendedores sincronizados`);
    return inserted;
}

async function syncAssignments() {
    console.log('\n📥 Sincronizando asignaciones...');

    const { data, error } = await supabase.from('assignments').select('*');

    if (error) {
        console.error('❌ Error:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay asignaciones');
        return 0;
    }

    await localPool.query('DELETE FROM assignments');

    let inserted = 0;
    for (const a of data) {
        try {
            await localPool.query(`
                INSERT INTO assignments (
                    id_asignacion, created_at, id_emprendedor, id_stand, semana,
                    jornada, bloque, asistio, estado, comentarios
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                a.id_asignacion, a.created_at, a.id_emprendedor, a.id_stand, a.semana,
                a.jornada, a.bloque, a.asistio, a.estado, a.comentarios
            ]);
            inserted++;
        } catch (err) {
            console.error(`   ⚠️ Error:`, err.message);
        }
    }

    console.log(`   ✅ ${inserted}/${data.length} asignaciones sincronizadas`);
    return inserted;
}

async function syncCustomSurveys() {
    console.log('\n📥 Sincronizando encuestas...');

    const { data, error } = await supabase.from('custom_surveys').select('*');

    if (error) {
        console.error('❌ Error:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay encuestas');
        return 0;
    }

    await localPool.query('DELETE FROM custom_surveys');

    let inserted = 0;
    for (const s of data) {
        try {
            await localPool.query(`
                INSERT INTO custom_surveys (
                    id, created_at, title, description, note, response_limit,
                    event_date, event_time, event_location, show_urgency_banner,
                    questions, survey_type, active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
                s.id, s.created_at, s.title, s.description, s.note, s.response_limit,
                s.event_date, s.event_time, s.event_location, s.show_urgency_banner,
                JSON.stringify(s.questions), s.survey_type, s.active
            ]);
            inserted++;
        } catch (err) {
            console.error(`   ⚠️ Error:`, err.message);
        }
    }

    console.log(`   ✅ ${inserted}/${data.length} encuestas sincronizadas`);
    return inserted;
}

async function syncSurveyResponses() {
    console.log('\n📥 Sincronizando respuestas de encuestas...');

    const { data, error } = await supabase.from('survey_responses').select('*');

    if (error) {
        console.error('❌ Error:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay respuestas');
        return 0;
    }

    await localPool.query('DELETE FROM survey_responses');

    let inserted = 0;
    for (const r of data) {
        try {
            await localPool.query(`
                INSERT INTO survey_responses (id, created_at, survey_id, answers)
                VALUES ($1, $2, $3, $4)
            `, [r.id, r.created_at, r.survey_id, JSON.stringify(r.answers)]);
            inserted++;
        } catch (err) {
            console.error(`   ⚠️ Error:`, err.message);
        }
    }

    console.log(`   ✅ ${inserted}/${data.length} respuestas sincronizadas`);
    return inserted;
}

async function syncInvitationLogs() {
    console.log('\n📥 Sincronizando logs de invitaciones...');

    const { data, error } = await supabase.from('invitation_logs').select('*').range(0, 4999);

    if (error) {
        console.error('❌ Error:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay logs');
        return 0;
    }

    await localPool.query('DELETE FROM invitation_logs');

    let inserted = 0;
    for (const l of data) {
        try {
            await localPool.query(`
                INSERT INTO invitation_logs (id, created_at, entrepreneur_id, channel, message, status)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [l.id, l.created_at, l.entrepreneur_id, l.channel, l.message, l.status]);
            inserted++;
        } catch (err) {
            // Silently skip duplicates
        }
    }

    console.log(`   ✅ ${inserted}/${data.length} logs sincronizados`);
    return inserted;
}

async function syncFairs() {
    console.log('\n📥 Sincronizando ferias...');

    const { data, error } = await supabase.from('fairs').select('*');

    if (error) {
        console.error('❌ Error:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay ferias');
        return 0;
    }

    await localPool.query('DELETE FROM fairs');

    let inserted = 0;
    for (const f of data) {
        try {
            await localPool.query(`
                INSERT INTO fairs (id, created_at, name, date, location, description, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [f.id, f.created_at, f.name, f.date, f.location, f.description, f.status]);
            inserted++;
        } catch (err) {
            console.error(`   ⚠️ Error:`, err.message);
        }
    }

    console.log(`   ✅ ${inserted}/${data.length} ferias sincronizadas`);
    return inserted;
}

async function syncFairEntrepreneurs() {
    console.log('\n📥 Sincronizando emprendedores de ferias...');

    const { data, error } = await supabase.from('fair_entrepreneurs').select('*');

    if (error) {
        console.error('❌ Error:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay emprendedores de ferias');
        return 0;
    }

    await localPool.query('DELETE FROM fair_entrepreneurs');

    let inserted = 0;
    for (const fe of data) {
        try {
            await localPool.query(`
                INSERT INTO fair_entrepreneurs (id, created_at, name, business_name, category, phone, email, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [fe.id, fe.created_at, fe.name, fe.business_name, fe.category, fe.phone, fe.email, fe.status]);
            inserted++;
        } catch (err) {
            console.error(`   ⚠️ Error:`, err.message);
        }
    }

    console.log(`   ✅ ${inserted}/${data.length} emprendedores de ferias sincronizados`);
    return inserted;
}

async function syncEarnings() {
    console.log('\n📥 Sincronizando ganancias...');

    const { data, error } = await supabase.from('earnings').select('*');

    if (error) {
        console.error('❌ Error:', error.message);
        return 0;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay ganancias');
        return 0;
    }

    await localPool.query('DELETE FROM earnings');

    let inserted = 0;
    for (const e of data) {
        try {
            await localPool.query(`
                INSERT INTO earnings (id, created_at, entrepreneur_id, entrepreneur_name, amount, date, week, notes)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [e.id, e.created_at, e.entrepreneur_id, e.entrepreneur_name, e.amount, e.date, e.week, e.notes]);
            inserted++;
        } catch (err) {
            console.error(`   ⚠️ Error:`, err.message);
        }
    }

    console.log(`   ✅ ${inserted}/${data.length} ganancias sincronizadas`);
    return inserted;
}

// === Ejecutar Sincronización Completa ===

async function runFullSync() {
    console.log('🚀 INICIANDO SINCRONIZACIÓN SUPABASE → POSTGRESQL LOCAL');
    console.log('═'.repeat(55));
    console.log(`📅 Fecha: ${new Date().toLocaleString('es-EC')}`);
    console.log(`🔗 Supabase: ${SUPABASE_URL}`);
    console.log(`💾 Local: localhost:5432/emprendedores`);
    console.log('═'.repeat(55));

    try {
        // Test conexión local
        await localPool.query('SELECT NOW()');
        console.log('✅ Conexión a PostgreSQL local exitosa');
    } catch (err) {
        console.error('❌ No se pudo conectar a PostgreSQL local:', err.message);
        console.log('\n🔧 Asegúrate de:');
        console.log('   1. PostgreSQL está corriendo');
        console.log('   2. La base de datos "emprendedores" existe');
        console.log('   3. Ejecutaste local_schema.sql en pgAdmin');
        process.exit(1);
    }

    const results = {
        entrepreneurs: await syncEntrepreneurs(),
        assignments: await syncAssignments(),
        surveys: await syncCustomSurveys(),
        responses: await syncSurveyResponses(),
        logs: await syncInvitationLogs(),
        fairs: await syncFairs(),
        fairEntrepreneurs: await syncFairEntrepreneurs(),
        earnings: await syncEarnings()
    };

    console.log('\n' + '═'.repeat(55));
    console.log('📊 RESUMEN DE SINCRONIZACIÓN');
    console.log('═'.repeat(55));
    console.log(`   👥 Emprendedores:    ${results.entrepreneurs}`);
    console.log(`   📋 Asignaciones:     ${results.assignments}`);
    console.log(`   📝 Encuestas:        ${results.surveys}`);
    console.log(`   💬 Respuestas:       ${results.responses}`);
    console.log(`   📧 Logs invitación:  ${results.logs}`);
    console.log(`   🎪 Ferias:           ${results.fairs}`);
    console.log(`   🏪 Emp. de ferias:   ${results.fairEntrepreneurs}`);
    console.log(`   💰 Ganancias:        ${results.earnings}`);
    console.log('═'.repeat(55));
    console.log('✅ BACKUP COMPLETO');
    console.log('═'.repeat(55));

    await localPool.end();
}

runFullSync().catch(console.error);
