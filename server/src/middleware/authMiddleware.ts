import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

interface JwtPayload {
    id: string | number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;
        const user = await prisma.user.findUnique({
            where: { id: parseInt(String(decoded.id)) },
            select: { id: true, name: true, email: true, role: true }
        });
        if (!user) {
            res.status(401).json({ message: 'Not authorized, user not found' });
            return;
        }
        (req as any).user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export const admin = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user && (req as any).user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};
