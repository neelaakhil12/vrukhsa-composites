import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { createRazorpayOrder, verifyPayment, getRazorpayConfig } from '../controllers/paymentController';

const router = express.Router();

router.get('/config', protect, getRazorpayConfig);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);

export const paymentRouter = router;
