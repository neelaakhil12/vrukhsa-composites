import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../lib/mysql';
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

        const [existingUsers] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
        if ((existingUsers as any[]).length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [insertResult] = await pool.query(
            'INSERT INTO User (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, 'user', new Date(), new Date()]
        );
        
        const userId = (insertResult as any).insertId;
        const token = generateToken(userId);
        
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            _id: userId,
            name,
            email,
            role: 'user',
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

        const [users] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
        const user = (users as any[])[0];

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
