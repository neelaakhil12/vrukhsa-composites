// Standard CommonJS Wrapper for Hostinger with Error Logging
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'ERROR_LOG.txt');
const log = (msg) => {
    const formattedMsg = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(formattedMsg);
    fs.appendFileSync(logFile, formattedMsg);
};

log('--- STARTING SERVER ---');
const indexPath = path.join(__dirname, 'server', 'dist', 'index.js');

try {
    log(`Attempting to load index from: ${indexPath}`);
    require(indexPath);
    log('✅ Server loaded successfully');
} catch (err) {
    log('❌ FATAL ERROR DURING STARTUP:');
    log(err.stack || err.message || JSON.stringify(err));
    process.exit(1);
}
