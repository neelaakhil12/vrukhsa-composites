import { Request, Response } from 'express';
export declare const createOrder: (req: Request, res: Response) => Promise<void>;
export declare const getMyOrders: (req: Request, res: Response) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response) => Promise<void>;
export declare const cancelOrder: (req: Request, res: Response) => Promise<void>;
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response) => Promise<void>;
export declare const updatePaymentStatus: (req: Request, res: Response) => Promise<void>;
export declare const updateOrderTracking: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map