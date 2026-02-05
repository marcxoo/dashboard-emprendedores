/**
 * Servidor local de sincronización
 * Recibe datos del dashboard y los guarda en PostgreSQL local
 * 
 * Ejecutar con: node local_sync_server.js
 */

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a PostgreSQL local
const pool = new pg.Pool({
    host: process.env.LOCAL_PG_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_PG_PORT || '5432'),
    database: process.env.LOCAL_PG_DATABASE || 'emprendedores',
    user: process.env.LOCAL_PG_USER || 'postgres',
    password: process.env.LOCAL_PG_PASSWORD || '123456'
});

// Test de conexión
pool.query('SELECT NOW()')
    .then(() => console.log('✅ Conectado a PostgreSQL local'))
    .catch(err => console.error('❌ Error conectando a PostgreSQL:', err.message));

// === ENDPOINTS ===

// Sincronizar emprendedor (INSERT o UPDATE)
app.post('/sync/entrepreneur', async (req, res) => {
    try {
        const e = req.body;

        // Intentar UPDATE primero, si no existe hacer INSERT
        const updateResult = await pool.query(`
            UPDATE entrepreneurs SET
                nombre_emprendimiento = $2,
                persona_contacto = $3,
                telefono = $4,
                correo = $5,
                ciudad = $6,
                actividad_economica = $7,
                red_social = $8,
                subcategoria_interna = $9,
                categoria_principal = $10,
                semaforizacion = $11,
                veces_en_stand = $12,
                ultima_semana_participacion = $13,
                ruc = $14,
                notas = $15
            WHERE id = $1
        `, [
            e.id, e.nombre_emprendimiento, e.persona_contacto, e.telefono,
            e.correo, e.ciudad, e.actividad_economica, e.red_social,
            e.subcategoria_interna, e.categoria_principal, e.semaforizacion,
            e.veces_en_stand, e.ultima_semana_participacion, e.ruc, e.notas
        ]);

        if (updateResult.rowCount === 0) {
            // No existía, hacer INSERT
            await pool.query(`
                INSERT INTO entrepreneurs (
                    id, nombre_emprendimiento, persona_contacto, telefono,
                    correo, ciudad, actividad_economica, red_social,
                    subcategoria_interna, categoria_principal, semaforizacion,
                    veces_en_stand, ultima_semana_participacion, ruc, notas
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            `, [
                e.id, e.nombre_emprendimiento, e.persona_contacto, e.telefono,
                e.correo, e.ciudad, e.actividad_economica, e.red_social,
                e.subcategoria_interna, e.categoria_principal, e.semaforizacion,
                e.veces_en_stand || 0, e.ultima_semana_participacion, e.ruc, e.notas
            ]);
            console.log(`✅ [INSERT] Emprendedor: ${e.persona_contacto}`);
        } else {
            console.log(`✅ [UPDATE] Emprendedor: ${e.persona_contacto}`);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error sincronizando emprendedor:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Eliminar emprendedor
app.delete('/sync/entrepreneur/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM entrepreneurs WHERE id = $1', [req.params.id]);
        console.log(`🗑️  Emprendedor eliminado: ID ${req.params.id}`);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error eliminando:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Sincronizar asignación
app.post('/sync/assignment', async (req, res) => {
    try {
        const a = req.body;

        await pool.query(`
            INSERT INTO assignments (
                id_asignacion, id_emprendedor, id_stand, semana,
                jornada, bloque, asistio, estado, comentarios
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id_asignacion) DO UPDATE SET
                asistio = EXCLUDED.asistio,
                estado = EXCLUDED.estado,
                comentarios = EXCLUDED.comentarios
        `, [
            a.id_asignacion, a.id_emprendedor, a.id_stand, a.semana,
            a.jornada, a.bloque, a.asistio, a.estado, a.comentarios
        ]);

        console.log(`✅ Asignación sincronizada: ${a.id_asignacion}`);
        res.json({ success: true });
    } catch (err) {
        console.error('❌ Error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// === FULL BACKUP ENDPOINT ===
// Triggered from the Portal UI button
app.post('/sync/full-backup', async (req, res) => {
    console.log('\n🔄 INICIANDO BACKUP COMPLETO DESDE UI...');

    try {
        // Dynamically import the sync functions
        const { createClient } = await import('@supabase/supabase-js');

        const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Missing Supabase credentials');
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Sync entrepreneurs
        console.log('📥 Sincronizando emprendedores...');
        const { data: entrepreneurs, error: empError } = await supabase
            .from('entrepreneurs')
            .select('*')
            .order('id', { ascending: true });

        if (empError) throw empError;

        // Delete all and reinsert
        await pool.query('DELETE FROM entrepreneurs');

        let inserted = 0;
        for (const e of entrepreneurs || []) {
            try {
                await pool.query(`
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
                // Skip duplicates
            }
        }

        console.log(`✅ ${inserted}/${entrepreneurs.length} emprendedores sincronizados`);
        console.log('🎉 BACKUP COMPLETO EXITOSO\n');

        res.json({
            success: true,
            message: 'Backup completado',
            entrepreneurs: inserted
        });

    } catch (err) {
        console.error('❌ Error en backup completo:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log('═'.repeat(50));
    console.log('🚀 SERVIDOR DE SINCRONIZACIÓN LOCAL');
    console.log('═'.repeat(50));
    console.log(`📡 Escuchando en: http://localhost:${PORT}`);
    console.log(`💾 PostgreSQL: localhost:5432/emprendedores`);
    console.log('═'.repeat(50));
    console.log('Esperando datos del dashboard...\n');
});
