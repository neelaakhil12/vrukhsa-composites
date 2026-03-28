"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLProductRepository = void 0;
const mysql_1 = __importDefault(require("../lib/mysql"));
class MySQLProductRepository {
    async findAll(filters = {}) {
        const { showDeleted, category, search } = filters;
        let query = 'SELECT * FROM Product';
        const params = [];
        const conditions = [];
        if (showDeleted !== 'true' && showDeleted !== true) {
            conditions.push('isDeleted = ?');
            params.push(false);
        }
        if (category) {
            conditions.push('category LIKE ?');
            params.push(`%${category}%`);
        }
        if (search) {
            conditions.push('(name LIKE ? OR description LIKE ? OR category LIKE ?)');
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        query += ' ORDER BY createdAt DESC';
        const [rows] = await mysql_1.default.query(query, params);
        return rows.map(this.mapRowToProduct);
    }
    async findById(id) {
        const [rows] = await mysql_1.default.query('SELECT * FROM Product WHERE id = ?', [id]);
        const result = rows[0];
        return result ? this.mapRowToProduct(result) : null;
    }
    async create(data) {
        const id = data.id || `VC-${Date.now()}`;
        const cleanData = {
            id,
            name: data.name,
            category: data.category || '',
            subCategory: data.subCategory || '',
            description: data.description || '',
            images: JSON.stringify(data.images || []),
            price: parseFloat(data.price) || 0,
            originalPrice: parseFloat(data.originalPrice) || 0,
            discountPercentage: parseFloat(data.discountPercentage) || 0,
            stockQuantity: parseInt(data.stockQuantity) || 0,
            variants: JSON.stringify(data.variants || []),
            specifications: JSON.stringify(data.specifications || {}),
            warranty: data.warranty || '',
            seller: data.seller || 'Vruksha Composites',
            isSponsored: data.isSponsored ? 1 : 0,
            deliveryTime: data.deliveryTime || '4-5 business days',
            isDeleted: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const keys = Object.keys(cleanData).join(', ');
        const placeholders = Object.keys(cleanData).map(() => '?').join(', ');
        const values = Object.values(cleanData);
        await mysql_1.default.query(`INSERT INTO Product (${keys}) VALUES (${placeholders})`, values);
        return this.findById(id);
    }
    async update(id, data) {
        // Define valid columns to prevent SQL errors from extra fields (like _id, __v, or invalid frontend fields)
        const VALID_COLUMNS = [
            'name', 'category', 'subCategory', 'description', 'images',
            'price', 'originalPrice', 'discountPercentage', 'stockQuantity',
            'variants', 'specifications', 'warranty', 'seller',
            'isSponsored', 'deliveryTime', 'isDeleted'
        ];
        const updates = [];
        const params = [];
        for (const [key, value] of Object.entries(data)) {
            if (!VALID_COLUMNS.includes(key))
                continue;
            updates.push(`${key} = ?`);
            if (['images', 'variants', 'specifications'].includes(key)) {
                params.push(JSON.stringify(value));
            }
            else if (key === 'isSponsored' || key === 'isDeleted') {
                params.push(value ? 1 : 0);
            }
            else {
                params.push(value);
            }
        }
        if (updates.length === 0 && !data.updatedAt)
            return this.findById(id);
        updates.push('updatedAt = ?');
        params.push(new Date());
        params.push(id);
        await mysql_1.default.query(`UPDATE Product SET ${updates.join(', ')} WHERE id = ?`, params);
        return this.findById(id);
    }
    async delete(id) {
        await mysql_1.default.query('UPDATE Product SET isDeleted = 1 WHERE id = ?', [id]);
        return true;
    }
    async restore(id) {
        await mysql_1.default.query('UPDATE Product SET isDeleted = 0 WHERE id = ?', [id]);
        return true;
    }
    mapRowToProduct(row) {
        return {
            ...row,
            images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
            variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants,
            specifications: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications,
            isSponsored: !!row.isSponsored,
            isDeleted: !!row.isDeleted
        };
    }
}
exports.MySQLProductRepository = MySQLProductRepository;
