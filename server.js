console.log('--- SERVER WRAPPER STARTING ---');
console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);

import('./server/dist/index.js')
    .then(() => console.log('✅ Entry point loaded successfully'))
    .catch(err => {
        console.error('❌ FATAL: Failed to load entry point:', err);
        process.exit(1);
    });
