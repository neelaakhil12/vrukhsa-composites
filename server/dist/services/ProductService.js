"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
class ProductService {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async getAllProducts(filters) {
        return await this.productRepository.findAll(filters);
    }
    async getProductById(id) {
        return await this.productRepository.findById(id);
    }
    async createProduct(data) {
        return await this.productRepository.create(data);
    }
    async updateProduct(id, data) {
        return await this.productRepository.update(id, data);
    }
    async deleteProduct(id) {
        return await this.productRepository.delete(id);
    }
    async restoreProduct(id) {
        return await this.productRepository.restore(id);
    }
}
exports.ProductService = ProductService;
