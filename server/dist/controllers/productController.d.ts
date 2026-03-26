import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';
export declare class ProductController {
    private productService;
    constructor(productService: ProductService);
    getAllProducts: (req: Request, res: Response) => Promise<void>;
    getProductById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    createProduct: (req: Request, res: Response) => Promise<void>;
    updateProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
    restoreProduct: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=productController.d.ts.map