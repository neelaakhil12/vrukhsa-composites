const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  console.log('📡 Verifying Remote Database Schema...');
  try {
    // Check if Cart table exists by trying to count its rows
    const count = await prisma.cart.count();
    console.log(`✅ Success! Cart table found in Hostinger Database. (Row count: ${count})`);
  } catch (err) {
    if (err.message.includes('Table') && err.message.includes('doesn\'t exist')) {
      console.log('❌ Cart table NOT found in Database.');
    } else {
      console.error('❌ Error during verification:', err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

verify();
