const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../server/.env') });

const BASE_URL = 'https://vrukshacomposites.com';

async function generateSitemap() {
    console.log('🚀 Starting Sitemap Generation...');
    
    let connection;
    try {
        connection = await mysql.createConnection(process.env.DATABASE_URL);
        
        // Static routes
        const staticRoutes = [
            '',
            '/cart',
            '/orders',
            '/account',
            '/become-seller',
            '/search'
        ];
        
        // Dynamic product routes
        const [products] = await connection.query('SELECT id FROM Product WHERE isDeleted = 0');
        const productRoutes = products.map(p => `/product/${p.id}`);
        
        // Dynamic category routes (optional but good)
        const [categories] = await connection.query('SELECT DISTINCT category FROM Product WHERE isDeleted = 0');
        const categoryRoutes = categories.map(c => `/search?category=${encodeURIComponent(c.category)}`);
        
        const allRoutes = [...staticRoutes, ...productRoutes, ...categoryRoutes];
        
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>${route.includes('/product/') ? 'weekly' : 'daily'}</changefreq>
    <priority>${route === '' ? '1.0' : route.includes('/product/') ? '0.8' : '0.5'}</priority>
  </url>`).join('\n')}
</urlset>`;

        const publicPath = path.join(__dirname, '../public');
        if (!fs.existsSync(publicPath)) fs.mkdirSync(publicPath);
        
        fs.writeFileSync(path.join(publicPath, 'sitemap.xml'), sitemap);
        console.log('✅ sitemap.xml generated successfully in /public');
        
        // Also generate robots.txt
        const robots = `User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml`;
        fs.writeFileSync(path.join(publicPath, 'robots.txt'), robots);
        console.log('✅ robots.txt generated successfully in /public');

    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
    } finally {
        if (connection) await connection.end();
    }
}

generateSitemap();
