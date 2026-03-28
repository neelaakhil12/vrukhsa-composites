import pool from '../lib/mysql';

export interface IReview {
    id?: number;
    productId: string;
    userId: number;
    rating: number;
    title?: string;
    comment?: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class MySQLReviewRepository {
    async findByProductId(productId: string): Promise<any[]> {
        const query = `
            SELECT r.*, u.name as userName 
            FROM Review r 
            JOIN User u ON r.userId = u.id 
            WHERE r.productId = ? AND r.status = 'approved'
            ORDER BY r.createdAt DESC
        `;
        const [rows] = await pool.query(query, [productId]);
        return rows as any[];
    }

    async findAll(): Promise<any[]> {
        const query = `
            SELECT r.*, u.name as userName, p.name as productName 
            FROM Review r 
            JOIN User u ON r.userId = u.id 
            JOIN Product p ON r.productId = p.id
            ORDER BY r.createdAt DESC
        `;
        const [rows] = await pool.query(query);
        return rows as any[];
    }

    async create(data: IReview): Promise<any> {
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
        const [result] = await pool.query(query, values);
        const insertId = (result as any).insertId;
        
        // Update product rating and review count
        await this.updateProductStats(data.productId);
        
        return { id: insertId, ...data };
    }

    async update(id: number, data: Partial<IReview>): Promise<any> {
        const updates: string[] = [];
        const params: any[] = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (['rating', 'title', 'comment', 'status'].includes(key)) {
                updates.push(`${key} = ?`);
                params.push(value);
            }
        }
        
        if (updates.length === 0) return null;
        
        updates.push('updatedAt = ?');
        params.push(new Date());
        params.push(id);
        
        await pool.query(`UPDATE Review SET ${updates.join(', ')} WHERE id = ?`, params);
        
        // If rating changed, update product stats
        const [reviewRow] = await pool.query('SELECT productId FROM Review WHERE id = ?', [id]);
        if ((reviewRow as any).length > 0) {
            await this.updateProductStats((reviewRow as any)[0].productId);
        }
        
        return true;
    }

    async delete(id: number): Promise<boolean> {
        const [reviewRow] = await pool.query('SELECT productId FROM Review WHERE id = ?', [id]);
        const productId = (reviewRow as any).length > 0 ? (reviewRow as any)[0].productId : null;
        
        await pool.query('DELETE FROM Review WHERE id = ?', [id]);
        
        if (productId) {
            await this.updateProductStats(productId);
        }
        
        return true;
    }

    private async updateProductStats(productId: string): Promise<void> {
        const query = `
            SELECT COUNT(*) as count, AVG(rating) as avgRating 
            FROM Review 
            WHERE productId = ? AND status = 'approved'
        `;
        const [rows] = await pool.query(query, [productId]);
        const stats = (rows as any)[0];
        
        const count = stats.count || 0;
        const rating = stats.avgRating || 0;
        
        await pool.query(
            'UPDATE Product SET rating = ?, reviewCount = ? WHERE id = ?', 
            [parseFloat(rating.toFixed(1)), count, productId]
        );
    }
}
