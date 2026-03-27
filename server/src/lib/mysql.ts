import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Try multiple .env locations for Hostinger compatibility
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const dbUrl = process.env.DATABASE_URL;

let pool: mysql.Pool;

if (!dbUrl) {
    console.error('⚠️ DATABASE_URL is not defined. Database features will not work.');
    // Create a dummy pool that will fail gracefully on queries
    pool = mysql.createPool({ host: 'localhost', user: 'root', database: 'test' });
} else {
    // We force it to use 'localhost' internally, which bypasses the Remote MySQL firewall
    const safeUrl = dbUrl.replace('srv1855.hstgr.io', 'localhost');

    pool = mysql.createPool(safeUrl);
    
    // Intercept all queries to catch any 500 errors natively
    const originalQuery = pool.query.bind(pool);
    pool.query = async function(...args: any[]) {
        try {
            // @ts-ignore
            return await originalQuery(...args);
        } catch (e: any) {
            const fs = require('fs');
            const errLog = { time: new Date().toISOString(), message: e.message, code: e.code, sqlMessage: e.sqlMessage, sql: e.sql, args };
            fs.writeFileSync(path.join(__dirname, '../../db_error.json'), JSON.stringify(errLog, null, 2));
            throw e;
        }
    } as any;
}

export default pool;

