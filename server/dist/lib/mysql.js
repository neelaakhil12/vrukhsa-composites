"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Try multiple .env locations for Hostinger compatibility
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
dotenv_1.default.config();
const dbUrl = process.env.DATABASE_URL;
let pool;
if (!dbUrl) {
    console.error('⚠️ DATABASE_URL is not defined. Database features will not work.');
    // Create a dummy pool that will fail gracefully on queries
    pool = promise_1.default.createPool({ host: 'localhost', user: 'root', database: 'test' });
}
else {
    // Parse database URL
    const url = new URL(dbUrl);
    // CRITICAL HOSTINGER FIX:
    // Hostinger often rejects internal connections to its own external domain (srv1855.hstgr.io)
    // because it sees the server's own IPv6 address and thinks it's an unauthorized remote connection.
    // We force it to use '127.0.0.1' internally, which bypasses the Remote MySQL firewall
    // and forces IPv4 instead of 'localhost' which may resolve to '::1' on Node 18+.
    const safeHost = '127.0.0.1';
    pool = promise_1.default.createPool({
        host: safeHost,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: decodeURIComponent(url.password),
        database: url.pathname.substring(1),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
    // Intercept all queries to catch any 500 errors natively
    const originalQuery = pool.query.bind(pool);
    pool.query = async function (...args) {
        try {
            // @ts-ignore
            return await originalQuery(...args);
        }
        catch (e) {
            const fs = require('fs');
            const errLog = { time: new Date().toISOString(), message: e.message, code: e.code, sqlMessage: e.sqlMessage, sql: e.sql, args };
            fs.writeFileSync(path_1.default.join(__dirname, '../../db_error.json'), JSON.stringify(errLog, null, 2));
            throw e;
        }
    };
}
exports.default = pool;
