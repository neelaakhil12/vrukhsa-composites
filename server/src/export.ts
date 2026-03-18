import mongoose from 'mongoose';
import fs from 'fs';
import Product from './models/Product';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart_clone';

async function exportProducts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({}).lean();
        console.log(`📦 Found ${products.length} products`);

        fs.writeFileSync('products_export.json', JSON.stringify(products, null, 2));
        console.log('✅ Exported to products_export.json');

        process.exit(0);
    } catch (error) {
        console.error('❌ Export failed:', error);
        process.exit(1);
    }
}

exportProducts();
