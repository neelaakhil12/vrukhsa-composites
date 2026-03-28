import { IProduct } from '../models/Product';
import { IProductRepository } from './IProductRepository';
export declare class MongoProductRepository implements IProductRepository {
    findAll(filters?: any): Promise<IProduct[]>;
    findById(id: string): Promise<IProduct | null>;
    create(data: Partial<IProduct>): Promise<IProduct>;
    update(id: string, data: Partial<IProduct>): Promise<IProduct | null>;
    delete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
//# sourceMappingURL=MongoProductRepository.d.ts.map