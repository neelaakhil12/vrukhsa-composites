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
// Configuration
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS configuration - Simplified for production
app.use((0, cors_1.default)({
    origin: true, // Allow all origins to ensure storefront always works
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
// Serve static files (uploads)
const UPLOADS_PATH = path_1.default.join(__dirname, '../../uploads');
app.use('/uploads', express_1.default.static(UPLOADS_PATH));
// Serve frontend static files
const DIST_PATH = path_1.default.join(__dirname, '../../dist');
app.use(express_1.default.static(DIST_PATH));
// Production Health Check with Version/Timestamp
const VERSION = '1.3.1-PRODUCTEDITFIX';
const DEPLOY_TIME = new Date().toISOString();
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        version: VERSION,
        deployed: DEPLOY_TIME,
        service: 'Vruksha Composites API',
        db: 'connected'
    });
});
// Catch-all route for SPA
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path_1.default.join(DIST_PATH, 'index.html'));
});
// Test DB Connection at startup
mysql_1.default.getConnection()
    .then(connection => {
    console.log('✅ Production Database Connection Established');
    connection.release();
})
    .catch((err) => console.error('❌ Connection Failed:', err.message));
app.listen(PORT, () => {
    console.log(`🚀 Production Server running on port ${PORT}`);
});
