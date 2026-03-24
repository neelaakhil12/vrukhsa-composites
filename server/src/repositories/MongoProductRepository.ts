import Product, { IProduct } from '../models/Product';
import { IProductRepository } from './IProductRepository';

export class MongoProductRepository implements IProductRepository {
    async findAll(filters: any = {}): Promise<IProduct[]> {
        const { showDeleted, ...allFilters } = filters;
        if (showDeleted === 'true' || showDeleted === true) {
            return await Product.find(allFilters);
        }
        // Exclude soft-deleted products by default
        return await Product.find({ ...allFilters, isDeleted: { $ne: true } });
    }

    async findById(id: string): Promise<IProduct | null> {
        return await Product.findOne({ _id: id });
    }

    async create(data: Partial<IProduct>): Promise<IProduct> {
        const product = new Product(data);
        return await product.save();
    }

    async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        return await Product.findOneAndUpdate(
            { _id: id, isDeleted: { $ne: true } },
            data,
            { new: true }
        );
    }

    async delete(id: string): Promise<boolean> {
        const result = await Product.updateOne(
            { _id: id },
            { isDeleted: true }
        );
        return result.modifiedCount > 0;
    }

    async restore(id: string): Promise<boolean> {
        const result = await Product.updateOne(
            { _id: id },
            { isDeleted: false }
        );
        return result.modifiedCount > 0;
    }
}
