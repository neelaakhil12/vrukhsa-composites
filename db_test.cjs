const mysql = require('mysql2/promise');

async function test(name, urlStr) {
    try {
        console.log(`[${name}] Testing connection...`);
        const url = new URL(urlStr);
        const connection = await mysql.createConnection({
            host: url.hostname,
            port: parseInt(url.port) || 3306,
            user: url.username,
            password: decodeURIComponent(url.password),
            database: url.pathname.substring(1),
            connectTimeout: 5000
        });
        await connection.query('SELECT 1');
        console.log(`[${name}] ✅ SUCCESS!`);
        await connection.end();
    } catch (e) {
        console.error(`[${name}] ❌ FAILED: ${e.message}`);
    }
}

async function runAll() {
    console.log("Environment variables exposed here:");
    console.log({
        DATABASE_URL: process.env.DATABASE_URL ? "Exists" : "MISSING",
        JWT_SECRET: process.env.JWT_SECRET ? "Exists" : "MISSING",
        PORT: process.env.PORT,
        NODE_ENV: process.env.NODE_ENV
    });

    const dbBase = 'mysql://u410995534_harishneela71:CodTech%401208@';
    const dbSuf = ':3306/u410995534_vrukshacompos';
    
    console.log("--- Starting Connection Tests ---");
    await test('Remote Host', dbBase + 'srv1855.hstgr.io' + dbSuf);
    await test('Localhost', dbBase + 'localhost' + dbSuf);
    await test('127.0.0.1', dbBase + '127.0.0.1' + dbSuf);
}

runAll().catch(console.error);
