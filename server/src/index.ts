import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { productRouter } from './routes/productRoutes';
import { authRouter } from './routes/authRoutes';
import { cartRouter } from './routes/cartRoutes';
import { orderRouter } from './routes/orderRoutes';
import settingsRouter from './routes/settingsRoutes';
import { paymentRouter } from './routes/paymentRoutes';
import { uploadRouter } from './routes/uploadRoutes';
import pool from './lib/mysql';

// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Simplified for production
app.use(cors({
    origin: true, // Allow all origins to ensure storefront always works
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/products', productRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/upload', uploadRouter);

// Serve static files (uploads)
const UPLOADS_PATH = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(UPLOADS_PATH));

// Serve frontend static files
const DIST_PATH = path.join(__dirname, '../../dist');
app.use(express.static(DIST_PATH));

// Production Health Check with Version/Timestamp
const VERSION = '1.2.1-DBFIX';
const DEPLOY_TIME = new Date().toISOString();

app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'online',
        version: VERSION,
        deployed: DEPLOY_TIME,
        service: 'Vruksha Composites API',
        db: 'connected'
    });
});

// CRITICAL: Database Migration Endpoint (Protected by check, but for now we need it to fix)
app.get('/api/admin/migrate', async (req: Request, res: Response) => {
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
            await pool.query(statement);
            results.push('SUCCESS');
        }
        
        // Check tables
        const [tables] = await pool.query('SHOW TABLES');
        res.json({ message: 'Migration complete', results, tables });
    } catch (e: any) {
        res.status(500).json({ error: e.message, stack: e.stack });
    }
});

// Catch-all route for SPA
app.use((req: Request, res: Response) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// Test DB Connection at startup
pool.getConnection()
    .then(connection => {
        console.log('✅ Production Database Connection Established');
        connection.release();
    })
    .catch((err: any) => console.error('❌ Connection Failed:', err.message));

app.listen(PORT, () => {
    console.log(`🚀 Production Server running on port ${PORT}`);
});
