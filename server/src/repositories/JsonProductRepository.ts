import fs from 'fs';
import path from 'path';
import { IProduct } from '../models/Product';
import { IProductRepository } from './IProductRepository';

const JSON_PATH = path.join(__dirname, '../../../src/data/products_master.json');

export class JsonProductRepository implements IProductRepository {
    private async readData(): Promise<any> {
        const data = await fs.promises.readFile(JSON_PATH, 'utf8');
        return JSON.parse(data);
    }

    private async writeData(data: any): Promise<void> {
        await fs.promises.writeFile(JSON_PATH, JSON.stringify(data, null, 4));
    }

    async findAll(filters: any = {}): Promise<IProduct[]> {
        const data = await this.readData();
        let products = data.products.filter((p: any) => !p.isDeleted);

        // Basic filtering logic
        if (filters.category) {
            products = products.filter((p: any) => p.category === filters.category);
        }

        return products;
    }

    async findById(id: string): Promise<IProduct | null> {
        const data = await this.readData();
        return data.products.find((p: any) => p.product_id === id && !p.isDeleted) || null;
    }

    async create(data: Partial<IProduct>): Promise<IProduct> {
        const db = await this.readData();
        const newProduct = {
            ...data,
            product_id: (data as any).product_id || `VC-NEW-${Date.now()}`,
            isDeleted: false
        } as any;

        db.products.push(newProduct);
        await this.writeData(db);
        return newProduct;
    }

    async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        const db = await this.readData();
        const index = db.products.findIndex((p: any) => p.product_id === id);

        if (index === -1 || db.products[index].isDeleted) return null;

        db.products[index] = { ...db.products[index], ...data };
        await this.writeData(db);
        return db.products[index];
    }

    async delete(id: string): Promise<boolean> {
        const db = await this.readData();
        const index = db.products.findIndex((p: any) => p.product_id === id);

        if (index === -1) return false;

        db.products[index].isDeleted = true;
        await this.writeData(db);
        return true;
    }

    async restore(id: string): Promise<boolean> {
        const db = await this.readData();
        const index = db.products.findIndex((p: any) => p.product_id === id);

        if (index === -1) return false;

        db.products[index].isDeleted = false;
        await this.writeData(db);
        return true;
    }
}
