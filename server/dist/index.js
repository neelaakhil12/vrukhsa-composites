"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const productRoutes_1 = require("./routes/productRoutes");
const authRoutes_1 = require("./routes/authRoutes");
const cartRoutes_1 = require("./routes/cartRoutes");
const orderRoutes_1 = require("./routes/orderRoutes");
const settingsRoutes_1 = __importDefault(require("./routes/settingsRoutes"));
const paymentRoutes_1 = require("./routes/paymentRoutes");
const uploadRoutes_1 = require("./routes/uploadRoutes");
const mysql_1 = __importDefault(require("./lib/mysql"));
// Load .env from project root (two levels up from server/dist/)
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
dotenv_1.default.config(); // also try CWD
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
// Middleware
const allowedOrigins = [
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8084',
    'http://localhost:5173',
    'https://indigo-rail-928301.hostingersite.com',
    'http://indigo-rail-928301.hostingersite.com',
    'https://vrukshacomposites.com',
    'http://vrukshacomposites.com',
    'https://www.vrukshacomposites.com',
    'http://www.vrukshacomposites.com',
    process.env.FRONTEND_URL
].filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin)
            return callback(null, true);
        // Allow any localhost
        if (origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        // Check if origin is allowed
        if (allowedOrigins.includes(origin) || process.env.FRONTEND_URL === '*') {
            return callback(null, true);
        }
        // Also allow any vercel.app or hostingersite.com domain
        if (origin.endsWith('.vercel.app') || origin.endsWith('.hostingersite.com') || origin.endsWith('vrukshacomposites.com')) {
            return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Routes
app.use('/api/products', productRoutes_1.productRouter);
app.use('/api/auth', authRoutes_1.authRouter);
app.use('/api/cart', cartRoutes_1.cartRouter);
app.use('/api/orders', orderRoutes_1.orderRouter);
app.use('/api/settings', settingsRoutes_1.default);
app.use('/api/payment', paymentRoutes_1.paymentRouter);
app.use('/api/upload', uploadRoutes_1.uploadRouter);
// Serve static files (uploads) - Use absolute path relative to current file to be robust on Hostinger
const UPLOADS_PATH = path_1.default.join(__dirname, '../../uploads');
app.use('/uploads', express_1.default.static(UPLOADS_PATH));
// Serve frontend static files
const DIST_PATH = path_1.default.join(__dirname, '../../dist');
app.use(express_1.default.static(DIST_PATH));
// Health Check
app.get('/api/health', (req, res) => {
    res.send('Vruksha Composites API is running');
});
// Temporary Debug Endpoint for MySQL connectivity
app.get('/api/debug-db', async (req, res) => {
    const results = {
        env: {
            hasDatabaseUrl: !!process.env.DATABASE_URL,
            dbUrlPreview: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 35) + '...' : null,
            nodeEnv: process.env.NODE_ENV
        },
        envUrl: {},
        tests: {}
    };
    if (process.env.DATABASE_URL) {
        try {
            const u = new URL(process.env.DATABASE_URL);
            results.envUrl = {
                username: u.username,
                passwordRef: decodeURIComponent(u.password),
                host: u.hostname,
                db: u.pathname.substring(1)
            };
        }
        catch (e) {
            results.envUrl = { error: e.message };
        }
    }
    const mysql = require('mysql2/promise');
    // Test 1: Using the exact environment variable
    if (process.env.DATABASE_URL) {
        try {
            const conn = await mysql.createConnection(process.env.DATABASE_URL + '&connectTimeout=3000');
            await conn.query('SELECT 1');
            results.tests.envVarTest = 'SUCCESS';
            await conn.end();
        }
        catch (e) {
            results.tests.envVarTest = `FAILED: ${e.message}`;
        }
    }
    // Test 2: Localhost specifically
    try {
        const rootUrl = 'mysql://u410995534_harishneela71:CodTech%401208@localhost:3306/u410995534_vrukshacompos?connectTimeout=3000';
        const conn2 = await mysql.createConnection(rootUrl);
        await conn2.query('SELECT 1');
        results.tests.localhostTest = 'SUCCESS';
        await conn2.end();
    }
    catch (e) {
        results.tests.localhostTest = `FAILED: ${e.message}`;
    }
    // Test 3: The Hostinger domain hostname
    try {
        const hstgrUrl = 'mysql://u410995534_harishneela71:CodTech%401208@srv1855.hstgr.io:3306/u410995534_vrukshacompos?connectTimeout=3000';
        const conn3 = await mysql.createConnection(hstgrUrl);
        await conn3.query('SELECT 1');
        results.tests.hstgrTest = 'SUCCESS';
        await conn3.end();
    }
    catch (e) {
        results.tests.hstgrTest = `FAILED: ${e.message}`;
    }
    res.json(results);
});
// Endpoint to view internal MySQL errors
app.get('/api/db-error-log', (req, res) => {
    const fs = require('fs');
    try {
        const errorLog = fs.readFileSync(path_1.default.join(__dirname, '../../db_error.json'), 'utf8');
        res.type('json').send(errorLog);
    }
    catch (e) {
        res.json({ message: "No database errors logged or file does not exist yet." });
    }
});
// Catch-all route for SPA (using middleware to avoid path-to-regexp issues)
app.use((req, res) => {
    // Check if it's an API request - don't serve index.html for missing API endpoints
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    // Serve the SPA index.html for all other routes
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path_1.default.join(DIST_PATH, 'index.html'));
});
// Test DB Connection
mysql_1.default.getConnection()
    .then(connection => {
    console.log('✅ Connected to MySQL Database (Pool)');
    connection.release();
})
    .catch((err) => console.error('❌ MySQL connection failed:', err));
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
