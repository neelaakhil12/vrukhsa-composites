"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logoutUser = exports.loginUser = exports.verifyOtp = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mysql_1 = __importDefault(require("../lib/mysql"));
const validation_1 = require("../utils/validation");
const mail_1 = require("../utils/mail");
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
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Create unverified user with OTP
        await mysql_1.default.query('INSERT INTO User (name, email, password, role, isVerified, otp, otpExpiry, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=?, password=?, otp=?, otpExpiry=?, isVerified=0', [name, email, hashedPassword, 'user', false, otp, otpExpiry, new Date(), new Date(), name, hashedPassword, otp, otpExpiry]);
        // Send OTP email
        const emailSent = await (0, mail_1.sendOTP)(email, otp);
        if (!emailSent) {
            res.status(500).json({ message: 'Failed to send verification email' });
            return;
        }
        res.status(200).json({
            message: 'Check your registered mail and enter the OTP to create your account',
            email
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.registerUser = registerUser;
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            res.status(400).json({ message: 'Email and OTP are required' });
            return;
        }
        const [users] = await mysql_1.default.query('SELECT * FROM User WHERE email = ?', [email]);
        const user = users[0];
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.isVerified) {
            res.status(400).json({ message: 'Account already verified' });
            return;
        }
        if (user.otp !== otp) {
            res.status(400).json({ message: 'Invalid OTP' });
            return;
        }
        if (new Date() > new Date(user.otpExpiry)) {
            res.status(400).json({ message: 'OTP has expired' });
            return;
        }
        // Mark as verified and clear OTP fields
        await mysql_1.default.query('UPDATE User SET isVerified = 1, otp = NULL, otpExpiry = NULL WHERE id = ?', [user.id]);
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
            message: 'Account verified successfully'
        });
    }
    catch (error) {
        console.error('OTP Verification error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.verifyOtp = verifyOtp;
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
        if (!user.isVerified && user.email !== 'admin@vrukshacomposites.com') {
            res.status(403).json({ message: 'Please verify your email address first' });
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
