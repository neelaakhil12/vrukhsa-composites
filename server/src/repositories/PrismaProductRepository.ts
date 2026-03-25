import { IProduct } from '../models/Product';
import { IProductRepository } from './IProductRepository';
import prisma from '../lib/prisma';

export class PrismaProductRepository implements IProductRepository {
    async findAll(filters: any = {}): Promise<any[]> {
        const { showDeleted, category, search, ...rest } = filters;
        const where: any = {};

        if (showDeleted !== 'true' && showDeleted !== true) {
            where.isDeleted = false;
        }

        if (category) {
            where.category = { contains: category };
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
                { category: { contains: search } },
            ];
        }

        return await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    async findById(id: string): Promise<any | null> {
        return await prisma.product.findUnique({ where: { id } });
    }

    async create(data: any): Promise<any> {
        const { _id, __v, ...cleanData } = data;
        return await prisma.product.create({
            data: {
                id: cleanData.id || `VC-${Date.now()}`,
                name: cleanData.name,
                category: cleanData.category || '',
                subCategory: cleanData.subCategory,
                description: cleanData.description,
                images: cleanData.images || [],
                price: parseFloat(cleanData.price) || 0,
                originalPrice: parseFloat(cleanData.originalPrice) || 0,
                discountPercentage: parseFloat(cleanData.discountPercentage) || 0,
                stockQuantity: parseInt(cleanData.stockQuantity) || 0,
                variants: cleanData.variants || [],
                specifications: cleanData.specifications || {},
                warranty: cleanData.warranty,
                seller: cleanData.seller || 'Vruksha Composites',
                isSponsored: !!cleanData.isSponsored,
                deliveryTime: cleanData.deliveryTime || '4-5 business days',
                isDeleted: false,
            }
        });
    }

    async update(id: string, data: any): Promise<any | null> {
        const { _id, __v, id: dataId, createdAt, ...updateData } = data;
        if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price) || 0;
        if (updateData.originalPrice !== undefined) updateData.originalPrice = parseFloat(updateData.originalPrice) || 0;
        if (updateData.stockQuantity !== undefined) updateData.stockQuantity = parseInt(updateData.stockQuantity) || 0;
        return await prisma.product.update({ where: { id }, data: { ...updateData, updatedAt: new Date() } });
    }

    async delete(id: string): Promise<boolean> {
        await prisma.product.update({ where: { id }, data: { isDeleted: true } });
        return true;
    }

    async restore(id: string): Promise<boolean> {
        await prisma.product.update({ where: { id }, data: { isDeleted: false } });
        return true;
    }
}
