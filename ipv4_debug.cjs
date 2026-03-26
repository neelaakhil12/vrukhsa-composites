const https = require('https');

function fetchIPv4(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'vrukshacomposites.com',
            port: 443,
            path: path,
            method: 'GET',
            family: 4, // Force IPv4 to avoid socket hangups on IPv6
            headers: {
                'User-Agent': 'Node/18 (DebugScript)'
            }
        };

        const req = https.request(options, res => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => { 
                console.log(`--- ${path} ---\\nStatus: ${res.statusCode}\\nResponse: ${data}\\n`);
                resolve();
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    try {
        await fetchIPv4('/api/debug-db');
        await fetchIPv4('/api/products');
        await fetchIPv4('/api/settings');
    } catch (e) {
        console.error("Fatal Error:", e);
    }
}

run();
