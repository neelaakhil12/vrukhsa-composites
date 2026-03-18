import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    updatePaymentStatus
} from '../controllers/orderController';
import { admin } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin only routes
router.get('/admin/all', admin, getAllOrders);
router.put('/:id/status', admin, updateOrderStatus);
router.put('/:id/payment', admin, updatePaymentStatus);

export const orderRouter = router;
