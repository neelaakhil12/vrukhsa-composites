const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('📡 Verifying Remote Database Schema...');
  try {
    const tableExists = await prisma.cart.count().catch(() => -1);
    if (tableExists !== -1) {
      console.log('✅ Found Cart table in Hostinger database!');
    } else {
      console.log('❌ Cart table NOT found.');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
