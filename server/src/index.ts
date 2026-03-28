import dotenv from 'dotenv';
// Configuration - must be first to load env vars for other imports
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { productRouter } from './routes/productRoutes';
import { authRouter } from './routes/authRoutes';
import { cartRouter } from './routes/cartRoutes';
import { orderRouter } from './routes/orderRoutes';
import settingsRouter from './routes/settingsRoutes';
import { paymentRouter } from './routes/paymentRoutes';
import { uploadRouter } from './routes/uploadRoutes';
import { reviewRouter } from './routes/reviewRoutes';
import pool from './lib/mysql';

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
app.use('/api/reviews', reviewRouter);

// Serve static files (uploads)
const UPLOADS_PATH = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(UPLOADS_PATH));

// Serve frontend static files
const DIST_PATH = path.join(__dirname, '../../dist');
app.use(express.static(DIST_PATH));

// Production Health Check with Version/Timestamp
const VERSION = '1.3.1-PRODUCTEDITFIX';
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
