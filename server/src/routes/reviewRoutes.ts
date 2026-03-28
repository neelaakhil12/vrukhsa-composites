import express from 'express';
import { reviewController } from '../controllers/reviewController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes
router.get('/product/:productId', reviewController.getReviewsByProductId);

// Protected routes (User)
router.post('/', protect, reviewController.createReview);

// Admin routes
router.get('/admin/all', protect, admin, reviewController.getAllReviews);
router.patch('/:id', protect, admin, reviewController.updateReview);
router.delete('/:id', protect, admin, reviewController.deleteReview);

export const reviewRouter = router;
