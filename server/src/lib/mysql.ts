import mysql from 'mysql2/promise';

// DEFINITIVE HOSTINGER FIX:
// We use the DATABASE_URL from .env if available, otherwise fallback.
const CONNECTION_STRING = process.env.DATABASE_URL || 'mysql://u410995534_harishneela71:CodTech%401208@srv1855.hstgr.io:3306/u410995534_vrukshacompos';

const pool = mysql.createPool(CONNECTION_STRING);

// Simple connection test
pool.getConnection()
    .then(conn => {
        console.log('✅ MySQL Pool is ready');
        conn.release();
    })
    .catch(err => {
        console.error('❌ MySQL Pool Critical Failure:', err.message);
    });

export default pool;
