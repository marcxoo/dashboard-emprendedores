
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
    host: process.env.LOCAL_PG_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_PG_PORT || '5432'),
    database: process.env.LOCAL_PG_DATABASE || 'emprendedores',
    user: process.env.LOCAL_PG_USER || 'postgres',
    password: process.env.LOCAL_PG_PASSWORD || '123456'
});

const addColumn = async () => {
    try {
        await pool.query(`
            ALTER TABLE entrepreneurs 
            ADD COLUMN IF NOT EXISTS logo_url TEXT;
        `);
        console.log('✅ Column logo_url added successfully');
        await pool.end();
    } catch (err) {
        console.error(err);
    }
};

addColumn();
