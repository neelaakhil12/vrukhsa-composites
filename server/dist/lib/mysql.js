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
    // We force it to use 'localhost' internally, which bypasses the Remote MySQL firewall
    const safeUrl = dbUrl.replace('srv1855.hstgr.io', 'localhost');
    pool = promise_1.default.createPool(safeUrl);
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
