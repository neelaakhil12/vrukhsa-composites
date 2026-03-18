import express from 'express';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate Limiter: 5 account creations/logins per minute per IP
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: 'Too many attempts, please try again later.'
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);

export const authRouter = router;
