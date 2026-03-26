"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRazorpayConfig = exports.verifyPayment = exports.createRazorpayOrder = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const mysql_1 = __importDefault(require("../lib/mysql"));
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});
// @desc    Create Razorpay Order
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, receipt } = req.body;
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: receipt || `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        if (!order)
            return res.status(500).send('Error creating Razorpay order');
        res.json(order);
    }
    catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.createRazorpayOrder = createRazorpayOrder;
// @desc    Verify Razorpay Payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId // Our internal MySQL order ID
         } = req.body;
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(sign.toString())
            .digest('hex');
        if (razorpay_signature === expectedSign) {
            // Payment verified - Update MySQL Order
            await mysql_1.default.query('UPDATE Order SET paymentStatus = ?, razorpayOrderId = ?, razorpayPaymentId = ?, razorpaySignature = ? WHERE id = ?', ['paid', razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId]);
            return res.status(200).json({ message: 'Payment verified successfully' });
        }
        else {
            return res.status(400).json({ message: 'Invalid signature sent!' });
        }
    }
    catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.verifyPayment = verifyPayment;
// @desc    Get Razorpay Config
const getRazorpayConfig = async (req, res) => {
    res.json({ keyId: process.env.RAZORPAY_KEY_ID || '' });
};
exports.getRazorpayConfig = getRazorpayConfig;
