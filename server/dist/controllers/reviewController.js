"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewController = exports.ReviewController = void 0;
const MySQLReviewRepository_1 = require("../repositories/MySQLReviewRepository");
const reviewRepository = new MySQLReviewRepository_1.MySQLReviewRepository();
class ReviewController {
    constructor() {
        this.getReviewsByProductId = async (req, res) => {
            try {
                const productId = req.params.productId;
                const reviews = await reviewRepository.findByProductId(productId);
                res.json(reviews);
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching reviews', error: error.message });
            }
        };
        this.createReview = async (req, res) => {
            try {
                const { productId, rating, title, comment } = req.body;
                // Assuming auth middleware puts user in req.user
                const userId = req.user?.id || 1; // Fallback to user 1 if no auth (should be protected by middleware)
                if (!productId || !rating) {
                    return res.status(400).json({ message: 'Product ID and Rating are required' });
                }
                const review = await reviewRepository.create({
                    productId,
                    userId,
                    rating: parseInt(rating),
                    title,
                    comment,
                    status: 'approved' // Automatically approve for now, or change to 'pending' if moderation needed
                });
                res.status(201).json(review);
            }
            catch (error) {
                res.status(500).json({ message: 'Error creating review', error: error.message });
            }
        };
        // Admin Methods
        this.getAllReviews = async (req, res) => {
            try {
                const reviews = await reviewRepository.findAll();
                res.json(reviews);
            }
            catch (error) {
                res.status(500).json({ message: 'Error fetching all reviews', error: error.message });
            }
        };
        this.updateReview = async (req, res) => {
            try {
                const id = req.params.id;
                const success = await reviewRepository.update(parseInt(id), req.body);
                if (!success) {
                    return res.status(404).json({ message: 'Review not found or no changes made' });
                }
                res.json({ message: 'Review updated successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Error updating review', error: error.message });
            }
        };
        this.deleteReview = async (req, res) => {
            try {
                const id = req.params.id;
                const success = await reviewRepository.delete(parseInt(id));
                if (!success) {
                    return res.status(404).json({ message: 'Review not found' });
                }
                res.json({ message: 'Review deleted successfully' });
            }
            catch (error) {
                res.status(500).json({ message: 'Error deleting review', error: error.message });
            }
        };
    }
}
exports.ReviewController = ReviewController;
exports.reviewController = new ReviewController();
