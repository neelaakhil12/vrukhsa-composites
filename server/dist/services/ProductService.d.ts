import { IProduct } from '../models/Product';
import { IProductRepository } from '../repositories/IProductRepository';
export declare class ProductService {
    private productRepository;
    constructor(productRepository: IProductRepository);
    getAllProducts(filters?: any): Promise<IProduct[]>;
    getProductById(id: string): Promise<IProduct | null>;
    createProduct(data: Partial<IProduct>): Promise<IProduct>;
    updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null>;
    deleteProduct(id: string): Promise<boolean>;
    restoreProduct(id: string): Promise<boolean>;
}
//# sourceMappingURL=ProductService.d.ts.map