const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config({ path: 'server/.env' });

async function checkTables() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await connection.query('SHOW TABLES');
    console.log('Tables:', rows);
    
    const [columns] = await connection.query('DESCRIBE Review');
    console.log('Review Table Columns:', columns);
    
    await connection.end();
}

checkTables().catch(console.error);
