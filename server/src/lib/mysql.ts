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
    // Parse database URL
    const url = new URL(dbUrl);
    
    // CRITICAL HOSTINGER FIX:
    // Hostinger often rejects internal connections to its own external domain (srv1855.hstgr.io)
    // because it sees the server's own IPv6 address and thinks it's an unauthorized remote connection.
    // We force it to use '127.0.0.1' internally, which bypasses the Remote MySQL firewall
    // and forces IPv4 instead of 'localhost' which may resolve to '::1' on Node 18+.
    const safeHost = '127.0.0.1';

    pool = mysql.createPool({
        host: safeHost,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: decodeURIComponent(url.password),
        database: url.pathname.substring(1),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
    
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

