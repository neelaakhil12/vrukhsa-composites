import { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { RegisterSchema, LoginSchema } from '../utils/validation';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response) => {
    try {
        // Validate Input
        const result = RegisterSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: 'Validation Error', errors: result.error });
            return;
        }

        const { name, email, password } = result.data;

        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            res.status(503).json({ message: 'Registration unavailable in Local JSON mode. Use mock login.' });
            return;
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Create User
        const user = await User.create({
            name,
            email,
            password,
        });

        if (user) {
            // Generate Token
            const token = generateToken(user._id as unknown as string);

            // Send HttpOnly Cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        // Validate Input
        const result = LoginSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: 'Validation Error', errors: result.error });
            return;
        }

        const { email, password } = result.data;

        // Check if MongoDB is connected
        if (mongoose.connection.readyState !== 1) {
            // Mock login for Local JSON mode
            if (email === 'admin@vruksha.com' && password === 'admin123') {
                const token = generateToken('mock-admin-id');
                res.cookie('jwt', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                });
                return res.json({
                    _id: 'mock-admin-id',
                    name: 'Local Admin',
                    email: 'admin@vruksha.com',
                    role: 'admin',
                });
            }
            res.status(503).json({ message: 'Login database unavailable. Use admin@vruksha.com / admin123 for local testing.' });
            return;
        }

        // Check User
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = generateToken(user._id as unknown as string);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
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
    // Current user is attached to req.user by middleware
    const user = (req as any).user;
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
