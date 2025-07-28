import { PrismaClient } from './generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testPassword() {
  try {
    const admin = await prisma.admin.findUnique({ 
      where: { email: 'admin@sendit.com' } 
    });
    
    if (admin) {
      console.log('✅ Admin found');
      console.log('Password hash:', admin.password);
      
      const testPassword = 'Admin@123';
      const isValid = await bcrypt.compare(testPassword, admin.password);
      
      console.log('Test password:', testPassword);
      console.log('Password valid:', isValid);
      
      // Test with a new hash
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash:', newHash);
      const isValidNew = await bcrypt.compare(testPassword, newHash);
      console.log('New hash valid:', isValidNew);
    } else {
      console.log('❌ Admin not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword(); 