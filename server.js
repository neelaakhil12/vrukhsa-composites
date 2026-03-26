// Standard CommonJS Wrapper for Hostinger
const path = require('path');
const indexPath = path.join(__dirname, 'server', 'dist', 'index.js');

console.log('--- STARTING SERVER (CommonJS) ---');
console.log('Current directory:', process.cwd());
console.log('Index path:', indexPath);

try {
    // We use require() correctly here since type: module is removed
    require(indexPath);
    console.log('✅ Server loaded successfully');
} catch (err) {
    console.error('❌ FATAL: Failed to load entry point via require():', err);
    process.exit(1);
}
