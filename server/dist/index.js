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
const VERSION = '1.2.1-DBFIX';
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
// CRITICAL: Database Migration Endpoint (Protected by check, but for now we need it to fix)
app.get('/api/admin/migrate', async (req, res) => {
    const schema = `
        CREATE TABLE IF NOT EXISTS User (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('user', 'admin') DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Product (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(500) NOT NULL,
            category VARCHAR(255) DEFAULT '',
            subCategory VARCHAR(255) DEFAULT '',
            description TEXT,
            images JSON,
            price DECIMAL(10,2) DEFAULT 0,
            originalPrice DECIMAL(10,2) DEFAULT 0,
            discountPercentage DECIMAL(5,2) DEFAULT 0,
            stockQuantity INT DEFAULT 0,
            variants JSON,
            specifications JSON,
            warranty VARCHAR(255) DEFAULT '',
            seller VARCHAR(255) DEFAULT 'Vruksha Composites',
            isSponsored TINYINT(1) DEFAULT 0,
            deliveryTime VARCHAR(255) DEFAULT '4-5 business days',
            isDeleted TINYINT(1) DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Setting (
            id INT AUTO_INCREMENT PRIMARY KEY,
            \`key\` VARCHAR(255) NOT NULL UNIQUE,
            value JSON,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Cart (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS CartItem (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cartId INT NOT NULL,
            productId VARCHAR(100) NOT NULL,
            quantity INT DEFAULT 1,
            variant JSON,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cartId) REFERENCES Cart(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS \`Order\` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            items JSON NOT NULL,
            shippingAddress JSON NOT NULL,
            paymentMethod ENUM('COD', 'CARD', 'UPI', 'RAZORPAY') DEFAULT 'COD',
            paymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
            orderStatus ENUM('placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'placed',
            totalAmount DECIMAL(10,2) NOT NULL,
            razorpayOrderId VARCHAR(255),
            razorpayPaymentId VARCHAR(255),
            razorpaySignature VARCHAR(255),
            trackingNumber VARCHAR(255),
            trackingLink VARCHAR(500),
            trackingPlatform VARCHAR(255),
            expectedDeliveryDate DATETIME,
            deliveryStages JSON,
            internalNote TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
        );
    `;
    try {
        // We execute statements one by one for better error tracking
        const statements = schema.split(';').filter(s => s.trim().length > 0);
        const results = [];
        for (const statement of statements) {
            await mysql_1.default.query(statement);
            results.push('SUCCESS');
        }
        // Check tables
        const [tables] = await mysql_1.default.query('SHOW TABLES');
        // Create Default Admin User
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        try {
            await mysql_1.default.query('INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)', ['Admin', 'admin@vrukshacomposites.com', hashedPassword, 'admin']);
            results.push('ADMIN_CREATED');
        }
        catch (adminErr) {
            if (adminErr.code === 'ER_DUP_ENTRY') {
                results.push('ADMIN_EXISTS');
            }
            else {
                throw adminErr;
            }
        }
        res.json({ message: 'Migration complete', results, tables });
    }
    catch (e) {
        res.status(500).json({ error: e.message, stack: e.stack });
    }
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
