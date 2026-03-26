"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonProductRepository = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const JSON_PATH = path_1.default.join(__dirname, '../../../src/data/products_master.json');
class JsonProductRepository {
    async readData() {
        const data = await fs_1.default.promises.readFile(JSON_PATH, 'utf8');
        return JSON.parse(data);
    }
    async writeData(data) {
        await fs_1.default.promises.writeFile(JSON_PATH, JSON.stringify(data, null, 4));
    }
    async findAll(filters = {}) {
        const data = await this.readData();
        const showDeleted = filters.showDeleted === 'true' || filters.showDeleted === true;
        let products = data.products;
        if (!showDeleted) {
            products = products.filter((p) => !p.isDeleted);
        }
        // Basic filtering logic
        if (filters.category) {
            products = products.filter((p) => p.category === filters.category);
        }
        return products;
    }
    async findById(id) {
        const data = await this.readData();
        return data.products.find((p) => p.product_id === id) || null;
    }
    async create(data) {
        const db = await this.readData();
        const newProduct = {
            ...data,
            product_id: data.product_id || `VC-NEW-${Date.now()}`,
            isDeleted: false
        };
        db.products.push(newProduct);
        await this.writeData(db);
        return newProduct;
    }
    async update(id, data) {
        const db = await this.readData();
        const index = db.products.findIndex((p) => p.product_id === id);
        if (index === -1 || db.products[index].isDeleted)
            return null;
        db.products[index] = { ...db.products[index], ...data };
        await this.writeData(db);
        return db.products[index];
    }
    async delete(id) {
        const db = await this.readData();
        const index = db.products.findIndex((p) => p.product_id === id);
        if (index === -1)
            return false;
        db.products[index].isDeleted = true;
        await this.writeData(db);
        return true;
    }
    async restore(id) {
        const db = await this.readData();
        const index = db.products.findIndex((p) => p.product_id === id);
        if (index === -1)
            return false;
        db.products[index].isDeleted = false;
        await this.writeData(db);
        return true;
    }
}
exports.JsonProductRepository = JsonProductRepository;
