"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLReviewRepository = void 0;
const mysql_1 = __importDefault(require("../lib/mysql"));
class MySQLReviewRepository {
    async findByProductId(productId) {
        const query = `
            SELECT r.*, u.name as userName 
            FROM Review r 
            JOIN User u ON r.userId = u.id 
            WHERE r.productId = ? AND r.status = 'approved'
            ORDER BY r.createdAt DESC
        `;
        const [rows] = await mysql_1.default.query(query, [productId]);
        return rows;
    }
    async findAll() {
        const query = `
            SELECT r.*, u.name as userName, p.name as productName 
            FROM Review r 
            JOIN User u ON r.userId = u.id 
            JOIN Product p ON r.productId = p.id
            ORDER BY r.createdAt DESC
        `;
        const [rows] = await mysql_1.default.query(query);
        return rows;
    }
    async create(data) {
        const query = `
            INSERT INTO Review (productId, userId, rating, title, comment, status, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.productId,
            data.userId,
            data.rating,
            data.title || null,
            data.comment || null,
            data.status || 'approved',
            new Date()
        ];
        const [result] = await mysql_1.default.query(query, values);
        const insertId = result.insertId;
        // Update product rating and review count
        await this.updateProductStats(data.productId);
        return { id: insertId, ...data };
    }
    async update(id, data) {
        const updates = [];
        const params = [];
        for (const [key, value] of Object.entries(data)) {
            if (['rating', 'title', 'comment', 'status'].includes(key)) {
                updates.push(`${key} = ?`);
                params.push(value);
            }
        }
        if (updates.length === 0)
            return null;
        updates.push('updatedAt = ?');
        params.push(new Date());
        params.push(id);
        await mysql_1.default.query(`UPDATE Review SET ${updates.join(', ')} WHERE id = ?`, params);
        // If rating changed, update product stats
        const [reviewRow] = await mysql_1.default.query('SELECT productId FROM Review WHERE id = ?', [id]);
        if (reviewRow.length > 0) {
            await this.updateProductStats(reviewRow[0].productId);
        }
        return true;
    }
    async delete(id) {
        const [reviewRow] = await mysql_1.default.query('SELECT productId FROM Review WHERE id = ?', [id]);
        const productId = reviewRow.length > 0 ? reviewRow[0].productId : null;
        await mysql_1.default.query('DELETE FROM Review WHERE id = ?', [id]);
        if (productId) {
            await this.updateProductStats(productId);
        }
        return true;
    }
    async updateProductStats(productId) {
        const query = `
            SELECT COUNT(*) as count, AVG(rating) as avgRating 
            FROM Review 
            WHERE productId = ? AND status = 'approved'
        `;
        const [rows] = await mysql_1.default.query(query, [productId]);
        const stats = rows[0];
        const count = stats.count || 0;
        const rating = stats.avgRating || 0;
        await mysql_1.default.query('UPDATE Product SET rating = ?, reviewCount = ? WHERE id = ?', [parseFloat(rating.toFixed(1)), count, productId]);
    }
}
exports.MySQLReviewRepository = MySQLReviewRepository;
