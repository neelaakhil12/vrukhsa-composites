// Entry point for Hostinger Phusion Passenger
// This file must be in the ROOT directory
const path = require('path');
const fs = require('fs');

const logFile = path.join(__dirname, 'ERROR_LOG.txt');
const log = (msg) => {
    const formattedMsg = `[${new Date().toISOString()}] ${msg}\n`;
    console.log(formattedMsg);
    fs.appendFileSync(logFile, formattedMsg);
};

log('--- HOSTINGER ROOT STARTUP ---');
const indexPath = path.join(__dirname, 'server', 'dist', 'index.js');

try {
    if (!fs.existsSync(indexPath)) {
        throw new Error(`Critical: Build file not found at ${indexPath}. Ensure 'npm run build' was successful.`);
    }
    
    log(`Loading application from: ${indexPath}`);
    require(indexPath);
    log('✅ Application bootstrapped successfully');
} catch (err) {
    log('❌ BOOTSTRAP FATAL ERROR:');
    log(err.stack || err.message || JSON.stringify(err));
    process.exit(1);
}
