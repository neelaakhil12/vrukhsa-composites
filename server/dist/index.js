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
const prisma_1 = __importDefault(require("./lib/prisma"));
dotenv_1.default.config();
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
        if (origin.endsWith('.vercel.app') || origin.endsWith('.hostingersite.com')) {
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
// Serve static files (uploads)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Serve frontend static files
app.use(express_1.default.static(path_1.default.join(__dirname, '../../dist')));
// Health Check
app.get('/api/health', (req, res) => {
    res.send('Vruksha Composites API is running');
});
// Catch-all route for SPA
app.get('*', (req, res) => {
    // Check if it's an API request - don't serve index.html for missing API endpoints
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path_1.default.join(__dirname, '../../dist/index.html'));
});
// Test DB Connection
prisma_1.default.$connect()
    .then(() => console.log('✅ Connected to MySQL Database (Prisma)'))
    .catch((err) => console.error('❌ MySQL/Prisma connection failed:', err));
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
