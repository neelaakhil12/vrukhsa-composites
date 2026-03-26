const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const config = {
  host: 'srv1855.hstgr.io',
  port: 3306,
  user: 'u410995534_harishneela71',
  password: 'CodTech@1208',
  database: 'u410995534_vrukshacompos'
};

async function main() {
  console.log('🚀 Connecting to MySQL directly...');
  const conn = await mysql.createConnection(config);
  console.log('✅ Connected!');

  const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // 1. Fix Admin Name
  console.log('👤 Updating Admin User name...');
  await conn.execute(
    "UPDATE User SET name = 'Vruksha Admin' WHERE email = 'admin@vrukshacomposites.com'"
  );
  console.log('✅ Admin name updated to Vruksha Admin');

  // 2. Initialize Site Settings
  console.log('⚙️ Initializing Site Settings (key: main)...');
  
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

  const defaultSettings = {
    banners: [
      { id: 'b1', image: '/nature-fiber images/banner1.jpg', title: 'Quality Fiber Composites', subtitle: 'Advanced materials for modern engineering', link: '/search' }
    ],
    categories: categories.map(c => ({ ...c, image: '' })),
    featuredProducts: [],
    aboutUs: '<h2>About Us</h2><p>Vruksha Composites is a leader in advanced materials innovation...</p>',
    privacyPolicy: '<h2>Privacy Policy</h2><p>Your privacy is important to us...</p>',
    termsAndConditions: '<h2>Terms & Conditions</h2><p>Please read these terms carefully...</p>',
    returnsPolicy: '<h2>Returns Policy</h2><p>Our standard return policy applies...</p>'
  };

  // Check if it exists
  const [rows] = await conn.execute('SELECT * FROM Setting WHERE `key` = "main"');
  if (rows.length > 0) {
    console.log('Updating existing settings...');
    await conn.execute(
      'UPDATE Setting SET value = ? WHERE `key` = "main"',
      [JSON.stringify(defaultSettings)]
    );
  } else {
    console.log('Creating new main settings...');
    await conn.execute(
      'INSERT INTO Setting (`key`, value) VALUES (?, ?)',
      ['main', JSON.stringify(defaultSettings)]
    );
  }

  console.log('✅ Site settings initialized!');
  await conn.end();
  console.log('👋 Done!');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
