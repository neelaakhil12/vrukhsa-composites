import { Request, Response } from 'express';
export declare class ReviewController {
    getReviewsByProductId: (req: Request, res: Response) => Promise<void>;
    createReview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    getAllReviews: (req: Request, res: Response) => Promise<void>;
    updateReview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteReview: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
export declare const reviewController: ReviewController;
//# sourceMappingURL=reviewController.d.ts.map