const mysql = require('mysql2/promise');

const DATABASE_URL = 'mysql://u410995534_harishneela71:CodTech%401208@srv1855.hstgr.io:3306/u410995534_vrukshacompos';

async function migrate() {
    const url = new URL(DATABASE_URL);
    const connection = await mysql.createConnection({
        host: url.hostname,
        port: parseInt(url.port) || 3306,
        user: url.username,
        password: decodeURIComponent(url.password),
        database: url.pathname.substring(1),
        multipleStatements: true,
    });

    console.log('✅ Connected to MySQL');

    const schema = `
        CREATE TABLE IF NOT EXISTS User (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('user', 'admin') DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Product (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(500) NOT NULL,
            category VARCHAR(255) DEFAULT '',
            subCategory VARCHAR(255) DEFAULT '',
            description TEXT,
            images JSON,
            price DECIMAL(10,2) DEFAULT 0,
            originalPrice DECIMAL(10,2) DEFAULT 0,
            discountPercentage DECIMAL(5,2) DEFAULT 0,
            stockQuantity INT DEFAULT 0,
            variants JSON,
            specifications JSON,
            warranty VARCHAR(255) DEFAULT '',
            seller VARCHAR(255) DEFAULT 'Vruksha Composites',
            isSponsored TINYINT(1) DEFAULT 0,
            deliveryTime VARCHAR(255) DEFAULT '4-5 business days',
            isDeleted TINYINT(1) DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Setting (
            id INT AUTO_INCREMENT PRIMARY KEY,
            \`key\` VARCHAR(255) NOT NULL UNIQUE,
            value JSON,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS Cart (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS CartItem (
            id INT AUTO_INCREMENT PRIMARY KEY,
            cartId INT NOT NULL,
            productId VARCHAR(100) NOT NULL,
            quantity INT DEFAULT 1,
            variant JSON,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cartId) REFERENCES Cart(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS \`Order\` (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            items JSON NOT NULL,
            shippingAddress JSON NOT NULL,
            paymentMethod ENUM('COD', 'CARD', 'UPI', 'RAZORPAY') DEFAULT 'COD',
            paymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
            orderStatus ENUM('placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled') DEFAULT 'placed',
            totalAmount DECIMAL(10,2) NOT NULL,
            razorpayOrderId VARCHAR(255),
            razorpayPaymentId VARCHAR(255),
            razorpaySignature VARCHAR(255),
            trackingNumber VARCHAR(255),
            trackingLink VARCHAR(500),
            trackingPlatform VARCHAR(255),
            expectedDeliveryDate DATETIME,
            deliveryStages JSON,
            internalNote TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
        );
    `;

    console.log('🔄 Creating tables...');
    await connection.query(schema);
    console.log('✅ All tables created successfully!');

    // Create admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    try {
        await connection.query(
            'INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Admin', 'admin@vrukshacomposites.com', hashedPassword, 'admin']
        );
        console.log('✅ Admin user created (email: admin@vrukshacomposites.com, password: admin123)');
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            console.log('ℹ️ Admin user already exists');
        } else {
            console.error('Admin creation error:', e.message);
        }
    }

    // Show tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Tables in database:', tables.map(t => Object.values(t)[0]));

    await connection.end();
    console.log('🎉 Migration complete!');
}

migrate().catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
});
