import mysql from 'mysql2/promise';

// DEFINITIVE HOSTINGER FIX:
// We hardcode the local connection string because Hostinger Environment Variables 
// are frequently corrupted or blocked by internal firewalls (IPv6 issues).
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
