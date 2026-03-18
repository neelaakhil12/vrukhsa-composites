import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
    id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    token = req.cookies.jwt;

    // Check if MongoDB is connected
    const isMongoConnected = mongoose.connection.readyState === 1;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

            if (isMongoConnected) {
                (req as any).user = await User.findById(decoded.id).select('-password');
            } else {
                // Fallback for Local JSON mode: Provide a mock user
                (req as any).user = {
                    _id: decoded.id,
                    name: 'Admin User (Local)',
                    email: 'admin@vruksha.com',
                    role: 'admin'
                };
            }

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        // Dev fallback: Allow access even without token if in Local JSON mode for easier testing
        if (!isMongoConnected) {
            (req as any).user = {
                _id: 'mock-admin-id',
                name: 'Dev Admin',
                email: 'admin@vruksha.com',
                role: 'admin'
            };
            return next();
        }
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user && (req as any).user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};
