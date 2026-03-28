import mysql from 'mysql2/promise';

// DEFINITIVE HOSTINGER FIX:
// We use localhost because Hostinger's internal network requires it for DB access.
const CONNECTION_STRING = 'mysql://u410995534_harishneela71:CodTech%401208@localhost:3306/u410995534_vrukshacompos';

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
