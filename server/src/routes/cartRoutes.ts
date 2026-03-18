import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from '../controllers/cartController';

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update/:productId', updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

export const cartRouter = router;
