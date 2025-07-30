const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAdminInAdminTable() {
  try {
    const admin = await prisma.admin.findFirst({
      where: { 
        email: 'kishoyianbrianmwangi@gmail.com'
      }
    });

    if (!admin) {
      console.log('❌ Admin not found in Admin table');
      return;
    }

    console.log('✅ Admin found in Admin table:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Password hash:', admin.password.substring(0, 20) + '...');

    // Test password verification
    const testPassword = 'brian123';
    const isValid = await bcrypt.compare(testPassword, admin.password);
    console.log('   Password "brian123" is valid:', isValid);

    // Test with different password
    const testPassword2 = 'wrongpassword';
    const isValid2 = await bcrypt.compare(testPassword2, admin.password);
    console.log('   Password "wrongpassword" is valid:', isValid2);

  } catch (error) {
    console.error('❌ Error checking admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminInAdminTable(); 