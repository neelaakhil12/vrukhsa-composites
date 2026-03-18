import { IProduct } from '../models/Product';
import { IProductRepository } from '../repositories/IProductRepository';

export class ProductService {
    constructor(private productRepository: IProductRepository) { }

    async getAllProducts(filters?: any) {
        return await this.productRepository.findAll(filters);
    }

    async getProductById(id: string) {
        return await this.productRepository.findById(id);
    }

    async createProduct(data: Partial<IProduct>) {
        return await this.productRepository.create(data);
    }

    async updateProduct(id: string, data: Partial<IProduct>) {
        return await this.productRepository.update(id, data);
    }

    async deleteProduct(id: string) {
        return await this.productRepository.delete(id);
    }

    async restoreProduct(id: string) {
        return await this.productRepository.restore(id);
    }
}
