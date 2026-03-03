
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

const listColumns = async () => {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'entrepreneurs';
        `);
        console.table(res.rows);
        await pool.end();
    } catch (err) {
        console.error(err);
    }
};

listColumns();
