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
    // We force it to use 'localhost' internally, which bypasses the Remote MySQL firewall.
    const safeHost = 'localhost';

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
}

export default pool;

