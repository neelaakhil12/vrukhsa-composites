"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaProductRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
class PrismaProductRepository {
    async findAll(filters = {}) {
        const { showDeleted, category, search, ...rest } = filters;
        const where = {};
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
        return await prisma_1.default.product.findMany({ where, orderBy: { createdAt: 'desc' } });
    }
    async findById(id) {
        return await prisma_1.default.product.findUnique({ where: { id } });
    }
    async create(data) {
        const { _id, __v, ...cleanData } = data;
        return await prisma_1.default.product.create({
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
    async update(id, data) {
        const { _id, __v, id: dataId, createdAt, ...updateData } = data;
        if (updateData.price !== undefined)
            updateData.price = parseFloat(updateData.price) || 0;
        if (updateData.originalPrice !== undefined)
            updateData.originalPrice = parseFloat(updateData.originalPrice) || 0;
        if (updateData.stockQuantity !== undefined)
            updateData.stockQuantity = parseInt(updateData.stockQuantity) || 0;
        return await prisma_1.default.product.update({ where: { id }, data: { ...updateData, updatedAt: new Date() } });
    }
    async delete(id) {
        await prisma_1.default.product.update({ where: { id }, data: { isDeleted: true } });
        return true;
    }
    async restore(id) {
        await prisma_1.default.product.update({ where: { id }, data: { isDeleted: false } });
        return true;
    }
}
exports.PrismaProductRepository = PrismaProductRepository;
