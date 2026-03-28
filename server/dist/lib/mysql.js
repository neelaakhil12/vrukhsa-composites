"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
// DEFINITIVE HOSTINGER FIX:
// We use the DATABASE_URL from .env if available, otherwise fallback.
const CONNECTION_STRING = process.env.DATABASE_URL || 'mysql://u410995534_harishneela71:CodTech%401208@srv1855.hstgr.io:3306/u410995534_vrukshacompos';
const pool = promise_1.default.createPool(CONNECTION_STRING);
// Simple connection test
pool.getConnection()
    .then(conn => {
    console.log('✅ MySQL Pool is ready');
    conn.release();
})
    .catch(err => {
    console.error('❌ MySQL Pool Critical Failure:', err.message);
});
exports.default = pool;
