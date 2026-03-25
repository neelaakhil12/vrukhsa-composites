import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { RegisterSchema, LoginSchema } from '../utils/validation';

const generateToken = (id: number | string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        const result = RegisterSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: 'Validation Error', errors: result.error });
            return;
        }

        const { name, email, password } = result.data;

        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        const token = generateToken(user.id);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const result = LoginSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: 'Validation Error', errors: result.error });
            return;
        }

        const { email, password } = result.data;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        const token = generateToken(user.id);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const logoutUser = (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user) {
        res.json({
            _id: user.id || user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
