import { Request, Response } from 'express';
import { MySQLReviewRepository } from '../repositories/MySQLReviewRepository';

const reviewRepository = new MySQLReviewRepository();

export class ReviewController {
    getReviewsByProductId = async (req: Request, res: Response) => {
        try {
            const productId = req.params.productId as string;
            const reviews = await reviewRepository.findByProductId(productId);
            res.json(reviews);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching reviews', error: error.message });
        }
    };

    createReview = async (req: Request, res: Response) => {
        try {
            const { productId, rating, title, comment } = req.body;
            // Assuming auth middleware puts user in req.user
            const userId = (req as any).user?.id || 1; // Fallback to user 1 if no auth (should be protected by middleware)

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
        } catch (error: any) {
            res.status(500).json({ message: 'Error creating review', error: error.message });
        }
    };

    // Admin Methods
    getAllReviews = async (req: Request, res: Response) => {
        try {
            const reviews = await reviewRepository.findAll();
            res.json(reviews);
        } catch (error: any) {
            res.status(500).json({ message: 'Error fetching all reviews', error: error.message });
        }
    };

    updateReview = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const success = await reviewRepository.update(parseInt(id), req.body);
            if (!success) {
                return res.status(404).json({ message: 'Review not found or no changes made' });
            }
            res.json({ message: 'Review updated successfully' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error updating review', error: error.message });
        }
    };

    deleteReview = async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const success = await reviewRepository.delete(parseInt(id));
            if (!success) {
                return res.status(404).json({ message: 'Review not found' });
            }
            res.json({ message: 'Review deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: 'Error deleting review', error: error.message });
        }
    };
}

export const reviewController = new ReviewController();
