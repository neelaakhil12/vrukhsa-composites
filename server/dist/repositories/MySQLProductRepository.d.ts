import { IProductRepository } from './IProductRepository';
export declare class MySQLProductRepository implements IProductRepository {
    findAll(filters?: any): Promise<any[]>;
    findById(id: string): Promise<any | null>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any | null>;
    delete(id: string): Promise<boolean>;
    restore(id: string): Promise<boolean>;
    private mapRowToProduct;
}
//# sourceMappingURL=MySQLProductRepository.d.ts.map