import { Request, Response } from 'express';
export declare const createRazorpayOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getRazorpayConfig: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=paymentController.d.ts.map