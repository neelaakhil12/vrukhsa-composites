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
import prisma from './lib/prisma';

dotenv.config();

const app = express();
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

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

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

// Serve static files (uploads) - Use absolute path relative to current file to be robust on Hostinger
const UPLOADS_PATH = path.join(__dirname, '../../uploads');
app.use('/uploads', express.static(UPLOADS_PATH));

// Serve frontend static files
const DIST_PATH = path.join(__dirname, '../../dist');
app.use(express.static(DIST_PATH));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
    res.send('Vruksha Composites API is running');
});

// Catch-all route for SPA
app.get('*', (req: Request, res: Response) => {
    // Check if it's an API request - don't serve index.html for missing API endpoints
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    
    // Explicitly prevent caching for the root index.html to ensure users always get the latest build
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// Test DB Connection
prisma.$connect()
    .then(() => console.log('✅ Connected to MySQL Database (Prisma)'))
    .catch((err: any) => console.error('❌ MySQL/Prisma connection failed:', err));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
