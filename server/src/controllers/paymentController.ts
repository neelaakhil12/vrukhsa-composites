import { Request, Response } from 'express';
import crypto from 'crypto';
import pool from '../lib/mysql';

// Lazy initialization — only create Razorpay instance when needed
// This prevents the app from crashing at startup if env vars are missing
let razorpayInstance: any = null;
const getRazorpay = () => {
    if (!razorpayInstance) {
        const Razorpay = require('razorpay');
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'NOT_SET',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'NOT_SET',
        });
    }
    return razorpayInstance;
};

// @desc    Create Razorpay Order
export const createRazorpayOrder = async (req: Request, res: Response) => {
    try {
        const { amount, receipt } = req.body;

        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const order = await getRazorpay().orders.create(options);
        if (!order) return res.status(500).send('Error creating Razorpay order');

        res.json(order);
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Verify Razorpay Payment
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Our internal MySQL order ID
        } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            // Payment verified - Update MySQL Order
            await pool.query(
                'UPDATE Order SET paymentStatus = ?, razorpayOrderId = ?, razorpayPaymentId = ?, razorpaySignature = ? WHERE id = ?',
                ['paid', razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId]
            );

            return res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid signature sent!' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// @desc    Get Razorpay Config
export const getRazorpayConfig = async (req: Request, res: Response) => {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID || '' });
};
