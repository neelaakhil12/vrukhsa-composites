"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mysql_1 = __importDefault(require("../lib/mysql"));
const validation_1 = require("../utils/validation");
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};
const registerUser = async (req, res) => {
    try {
        const result = validation_1.RegisterSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: 'Validation Error', errors: result.error });
            return;
        }
        const { name, email, password } = result.data;
        const [existingUsers] = await mysql_1.default.query('SELECT * FROM User WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const [insertResult] = await mysql_1.default.query('INSERT INTO User (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)', [name, email, hashedPassword, 'user', new Date(), new Date()]);
        const userId = insertResult.insertId;
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
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const result = validation_1.LoginSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: 'Validation Error', errors: result.error });
            return;
        }
        const { email, password } = result.data;
        const [users] = await mysql_1.default.query('SELECT * FROM User WHERE email = ?', [email]);
        const user = users[0];
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.loginUser = loginUser;
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};
exports.logoutUser = logoutUser;
const getMe = async (req, res) => {
    const user = req.user;
    if (user) {
        res.json({
            _id: user.id || user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    }
    else {
        res.status(404).json({ message: 'User not found' });
    }
};
exports.getMe = getMe;
