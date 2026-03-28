"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
// Public routes
router.get('/product/:productId', reviewController_1.reviewController.getReviewsByProductId);
// Protected routes (User)
router.post('/', authMiddleware_1.protect, reviewController_1.reviewController.createReview);
// Admin routes
router.get('/admin/all', authMiddleware_1.protect, authMiddleware_1.admin, reviewController_1.reviewController.getAllReviews);
router.patch('/:id', authMiddleware_1.protect, authMiddleware_1.admin, reviewController_1.reviewController.updateReview);
router.delete('/:id', authMiddleware_1.protect, authMiddleware_1.admin, reviewController_1.reviewController.deleteReview);
exports.reviewRouter = router;
