"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
// Hardcoded categories to avoid import issues
const categories = [
    { id: 'natural fibers', name: 'Natural Fibers', icon: '🌿' },
    { id: 'synthetic fibers', name: 'Synthetic Fibers', icon: '🧵' },
    { id: 'nano products', name: 'Nano Products', icon: '🔬' },
    { id: 'chemical powders', name: 'Chemical Powders', icon: '🧪' },
    { id: 'resins', name: 'Resins', icon: '🧴' },
    { id: 'composite making', name: 'Composite Making', icon: '🛠️' },
    { id: 'additive nanoworks', name: 'Additive NanoWorks', icon: '⚗️' },
    { id: 'additive nanoworks - pure micro powder', name: 'Micro Powder (ANW)', icon: '🌫️' },
    { id: 'additive nanoworks - pure nano powder', name: 'Nano Powder (ANW)', icon: '⚛️' },
    { id: 'additive nanoworks - pure oxide micro powder', name: 'Oxide Micro Powder', icon: '⚪' },
    { id: 'additive nanoworks - pure oxide nano powder', name: 'Oxide Nano Powder', icon: '❄️' },
    { id: 'additive nanoworks - spherical powders', name: 'Spherical Powders', icon: '🔮' },
    { id: 'yarns', name: 'Yarns', icon: '🧵' },
    { id: 'fiber fabrics', name: 'Fiber Fabrics', icon: '📏' },
    { id: 'rebars', name: 'Rebars', icon: '🏗️' },
    { id: 'testing services', name: 'Testing Services', icon: '🧪' },
];
async function main() {
    console.log('🌱 Starting Seeding...');
    // 0. Seed Admin User
    console.log('👤 Seeding Admin User...');
    const adminPassword = await bcryptjs_1.default.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@vrukshacomposites.com' },
        update: {
            name: 'Vruksha Admin',
            password: adminPassword,
            role: 'admin'
        },
        create: {
            name: 'Vruksha Admin',
            email: 'admin@vrukshacomposites.com',
            password: adminPassword,
            role: 'admin'
        }
    });
    console.log('✅ Seeded admin user: admin@vrukshacomposites.com / admin123');
    // 1. Seed Site Settings (Appearance & CMS)
    console.log('⚙️ Seeding Site Settings...');
    const defaultSettings = {
        banners: [
            { id: 'b1', image: '/nature-fiber images/banner1.jpg', title: 'Quality Fiber Composites', subtitle: 'Advanced materials for modern engineering', link: '/search' }
        ],
        categories: categories.map(c => ({ ...c, image: '' })),
        featuredProducts: [],
        aboutUs: '<h2>About Us</h2><p>Vruksha Composites is a leader in advanced materials...</p>',
        privacyPolicy: '<h2>Privacy Policy</h2><p>Your privacy is important to us...</p>',
        termsAndConditions: '<h2>Terms & Conditions</h2><p>Please read these terms carefully...</p>',
        returnsPolicy: '<h2>Returns Policy</h2><p>Our standard return policy apply...</p>'
    };
    await prisma.setting.upsert({
        where: { key: 'main' },
        update: { value: defaultSettings },
        create: { key: 'main', value: defaultSettings }
    });
    console.log('✅ Seeded site settings!');
    // 2. Seed Categories (Standalone table)
    console.log('📂 Seeding Categories...');
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { id: cat.id },
            update: { name: cat.name, icon: cat.icon },
            create: { id: cat.id, name: cat.name, icon: cat.icon }
        });
    }
    console.log(`✅ Seeded ${categories.length} categories!`);
    // 3. Seed Products
    console.log('📦 Seeding Products...');
    // Use the file we copied into the server/src/data directory
    const masterPath = path_1.default.join(__dirname, './data/products_master.json');
    if (!fs_1.default.existsSync(masterPath)) {
        throw new Error(`Master JSON not found at ${masterPath}`);
    }
    const masterData = JSON.parse(fs_1.default.readFileSync(masterPath, 'utf-8'));
    const productsList = masterData.products;
    for (const item of productsList) {
        // ... (rest of product logic remains same)
        const specs = {};
        if (item.specifications) {
            Object.entries(item.specifications).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    specs[key] = value.join(', ');
                }
                else {
                    specs[key] = String(value);
                }
            });
        }
        let categoryId = (item.category || '').toLowerCase();
        if (item.category === 'Additive NanoWorks' && item.subcategory) {
            let sub = item.subcategory.toLowerCase();
            if (sub.includes('spherical powders'))
                sub = 'spherical powders';
            categoryId = `${item.category.toLowerCase()} - ${sub}`;
        }
        if (item.subcategory === 'Yarns')
            categoryId = 'yarns';
        if (item.subcategory === 'Fabrics')
            categoryId = 'fiber fabrics';
        if (item.subcategory === 'Rebars')
            categoryId = 'rebars';
        if (item.subcategory === 'Chemical Powders')
            categoryId = 'chemical powders';
        if (item.subcategory === 'Resins')
            categoryId = 'resins';
        if (item.subcategory === 'Testing Services')
            categoryId = 'testing services';
        let description = item.product_name || 'No Name Product';
        if (item.applications && item.applications.length > 0) {
            description = `Applications: ${item.applications.join(', ')}`;
        }
        else if (item.tags && item.tags.length > 0) {
            description = item.tags.join(', ');
        }
        const variants = [];
        if (item.specifications) {
            if (Array.isArray(item.specifications.sizes) && item.specifications.sizes.length > 0) {
                variants.push({ name: 'Size', options: item.specifications.sizes });
            }
            else if (Array.isArray(item.specifications.types_available) && item.specifications.types_available.length > 0) {
                if (item.subcategory === 'Yarns' || (item.product_name && item.product_name.toLowerCase().includes('yarn'))) {
                    variants.push({ name: 'Size', options: item.specifications.types_available });
                }
                else {
                    variants.push({ name: 'Type', options: item.specifications.types_available });
                }
            }
        }
        const productId = item.product_id || `VC-${Math.random().toString(36).substr(2, 9)}`;
        await prisma.product.upsert({
            where: { id: productId },
            update: {
                name: item.product_name || 'No Name Product',
                category: categoryId,
                subCategory: item.subcategory ? item.subcategory.toLowerCase() : '',
                description: description,
                images: (item.images && item.images.length > 0) ? item.images : [],
                variants: variants,
                specifications: specs,
                updatedAt: new Date()
            },
            create: {
                id: productId,
                name: item.product_name || 'No Name Product',
                category: categoryId,
                subCategory: item.subcategory ? item.subcategory.toLowerCase() : '',
                description: description,
                images: (item.images && item.images.length > 0) ? item.images : [],
                price: 0,
                originalPrice: 0,
                discountPercentage: 0,
                stockQuantity: 100,
                variants: variants,
                specifications: specs,
                warranty: 'Standard Warranty',
                seller: masterData.company_info.vruksha_composites.name,
                isSponsored: false,
                isDeleted: false
            }
        });
    }
    console.log(`✅ Seeded ${productsList.length} products!`);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
