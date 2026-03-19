import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Seeding...');

    const masterPath = path.join(__dirname, '../../../src/data/products_master.json');
    const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf-8'));

    const products = masterData.products;

    for (const item of products) {
        // Process specifications to match Record<string, string>
        const specs: any = {};
        if (item.specifications) {
            Object.entries(item.specifications).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    specs[key] = value.join(', ');
                } else {
                    specs[key] = String(value);
                }
            });
        }

        // Determine category based on product info
        let category = (item.category || '').toLowerCase();

        // Special handling: Promote Additive NanoWorks subcategories to top-level category IDs
        if (item.category === 'Additive NanoWorks' && item.subcategory) {
            let sub = item.subcategory.toLowerCase();
            if (sub.includes('spherical powders')) {
                sub = 'spherical powders';
            }
            category = `${item.category.toLowerCase()} - ${sub}`;
        }

        // Handle subcategories
        if (item.subcategory === 'Yarns') category = 'yarns';
        if (item.subcategory === 'Fabrics') category = 'fiber fabrics';
        if (item.subcategory === 'Rebars') category = 'rebars';
        if (item.subcategory === 'Chemical Powders') category = 'chemical powders';
        if (item.subcategory === 'Resins') category = 'resins';
        if (item.subcategory === 'Testing Services') category = 'testing services';

        // Description
        let description = item.product_name || 'No Name Product';
        if (item.applications && item.applications.length > 0) {
            description = `Applications: ${item.applications.join(', ')}`;
        } else if (item.tags && item.tags.length > 0) {
            description = item.tags.join(', ');
        }

        // Map Variants
        const variants: any[] = [];
        if (item.specifications) {
            if (Array.isArray(item.specifications.sizes) && item.specifications.sizes.length > 0) {
                variants.push({ name: 'Size', options: item.specifications.sizes });
            } else if (Array.isArray(item.specifications.types_available) && item.specifications.types_available.length > 0) {
                if (item.subcategory === 'Yarns' || (item.product_name && item.product_name.toLowerCase().includes('yarn'))) {
                    variants.push({ name: 'Size', options: item.specifications.types_available });
                } else {
                    variants.push({ name: 'Type', options: item.specifications.types_available });
                }
            }
        }

        const productId = item.product_id || `VC-${Math.random().toString(36).substr(2, 9)}`;

        await prisma.product.upsert({
            where: { id: productId },
            update: {},
            create: {
                id: productId,
                name: item.product_name || 'No Name Product',
                category: category,
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

    console.log(`✅ Seeded ${products.length} products!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
