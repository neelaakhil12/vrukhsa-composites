// Direct MySQL2 seeder - bypasses Prisma entirely
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_URL = 'mysql://u410995534_vruksha:Codtech@1208@srv1855.hstgr.io:3306/u410995534_vruksha';

// Parse the URL manually since the password contains @
const config = {
  host: 'srv1855.hstgr.io',
  port: 3306,
  user: 'u410995534_harishneela71',
  password: 'CodTech@1208',
  database: 'u410995534_vrukshacompos'
};

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
  console.log('🚀 Connecting to MySQL directly...');
  const conn = await mysql.createConnection(config);
  console.log('✅ Connected!');

  // 0. Seed Admin User
  console.log('👤 Seeding Admin User...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Use a try-catch for the user insert to handle existing users if necessary, 
  // or use INSERT IGNORE / ON DUPLICATE KEY UPDATE
  await conn.execute(
    'INSERT INTO User (name, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = ?, role = ?, updatedAt = ?',
    ['Vruksha Admin', 'admin@vrukshacomposites.com', adminPassword, 'admin', timestamp, timestamp, adminPassword, 'admin', timestamp]
  );
  console.log('✅ Seeded admin user: admin@vrukshacomposites.com / admin123');

  // 1. Clean existing data
  console.log('🧹 Cleaning existing data...');
  await conn.execute('DELETE FROM Product');
  await conn.execute('DELETE FROM Category');

  // 2. Seed Categories
  console.log('📂 Seeding Categories...');
  for (const cat of categories) {
    await conn.execute(
      'INSERT INTO Category (id, name, icon) VALUES (?, ?, ?)',
      [cat.id, cat.name, cat.icon]
    );
  }
  console.log(`✅ Seeded ${categories.length} categories!`);

  // 3. Seed Products
  console.log('📦 Seeding Products...');
  const masterPath = path.join(__dirname, 'src/data/products_master.json');
  const masterData = JSON.parse(fs.readFileSync(masterPath, 'utf-8'));
  const products = masterData.products;

  let count = 0;
  for (const item of products) {
    const specs = {};
    if (item.specifications) {
      Object.entries(item.specifications).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          specs[key] = value.join(', ');
        } else {
          specs[key] = String(value);
        }
      });
    }

    let categoryId = (item.category || '').toLowerCase();
    if (item.category === 'Additive NanoWorks' && item.subcategory) {
      let sub = item.subcategory.toLowerCase();
      if (sub.includes('spherical powders')) sub = 'spherical powders';
      categoryId = `${item.category.toLowerCase()} - ${sub}`;
    }
    if (item.subcategory === 'Yarns') categoryId = 'yarns';
    if (item.subcategory === 'Fabrics') categoryId = 'fiber fabrics';
    if (item.subcategory === 'Rebars') categoryId = 'rebars';
    if (item.subcategory === 'Chemical Powders') categoryId = 'chemical powders';
    if (item.subcategory === 'Resins') categoryId = 'resins';
    if (item.subcategory === 'Testing Services') categoryId = 'testing services';

    let description = item.product_name || 'No Name Product';
    if (item.applications && item.applications.length > 0) {
      description = `Applications: ${item.applications.join(', ')}`;
    } else if (item.tags && item.tags.length > 0) {
      description = item.tags.join(', ');
    }

    const variants = [];
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
    const images = (item.images && item.images.length > 0) ? item.images : [];
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await conn.execute(
      `INSERT INTO Product (id, name, category, subCategory, description, images, price, originalPrice, discountPercentage, rating, reviewCount, inStock, stockQuantity, variants, specifications, warranty, seller, isSponsored, isDeleted, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        item.product_name || 'No Name Product',
        categoryId,
        item.subcategory ? item.subcategory.toLowerCase() : '',
        description,
        JSON.stringify(images),
        0, // price
        0, // originalPrice
        0, // discountPercentage
        4.5, // rating
        0, // reviewCount
        1, // inStock (true)
        100, // stockQuantity
        JSON.stringify(variants),
        JSON.stringify(specs),
        'Standard Warranty',
        masterData.company_info.vruksha_composites.name,
        0, // isSponsored (false)
        0, // isDeleted (false)
        now,
        now
      ]
    );
    count++;
    if (count % 50 === 0) console.log(`  ... ${count} products inserted`);
  }

  console.log(`\n✅ SEEDING COMPLETE! ${count} products seeded successfully!`);
  await conn.end();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
