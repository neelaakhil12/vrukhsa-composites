import { IProduct } from '../models/Product';
export interface IProductRepository {
    findAll(filters?: any): Promise<IProduct[]>;
    findById(id: string): Promise<IProduct | null>;
    create(data: Partial<IProduct>): Promise<IProduct>;
    update(id: string, data: Partial<IProduct>): Promise<IProduct | null>;
    delete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
}
//# sourceMappingURL=IProductRepository.d.ts.map