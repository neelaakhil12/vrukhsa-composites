import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('Testing connection to:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@'));
    const userCount = await prisma.user.count();
    console.log('Connection successful! User count:', userCount);
  } catch (err) {
    console.error('Connection failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
