import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

// Parse Prisma-style database URL
// Example: mysql://user:password@host:port/database
const url = new URL(dbUrl);

const pool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.substring(1), // remove leading /
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
