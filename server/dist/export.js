"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const Product_1 = __importDefault(require("./models/Product"));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart_clone';
async function exportProducts() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        const products = await Product_1.default.find({}).lean();
        console.log(`📦 Found ${products.length} products`);
        fs_1.default.writeFileSync('products_export.json', JSON.stringify(products, null, 2));
        console.log('✅ Exported to products_export.json');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
}
exportProducts();
