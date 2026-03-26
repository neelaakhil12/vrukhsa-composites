const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('🔍 Checking Environment...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.split(':')[0] : 'MISSING');
  
  console.log('\n📡 Testing Database Connection...');
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected successfully!');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Total Users: ${userCount}`);
    
    const settings = await prisma.setting.findUnique({ where: { key: 'main' } });
    console.log('⚙️ Settings Found:', settings ? 'YES' : 'NO');
    
    if (settings) {
      const val = settings.value;
      console.log(`🖼️ Banners: ${val.banners?.length || 0}`);
      console.log(`📁 Categories: ${val.categories?.length || 0}`);
    }
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
