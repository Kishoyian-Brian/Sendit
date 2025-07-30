const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserTables() {
  try {
    const email = 'brianmwasbayo@gmail.com';
    
    console.log('🔍 Checking for user with email:', email);
    
    // Check User table
    const user = await prisma.user.findFirst({
      where: { email }
    });
    
    if (user) {
      console.log('✅ Found in User table:');
      console.log('   ID:', user.id);
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   isVerified:', user.isVerified);
    } else {
      console.log('❌ Not found in User table');
    }
    
    // Check Admin table
    const admin = await prisma.admin.findFirst({
      where: { email }
    });
    
    if (admin) {
      console.log('✅ Found in Admin table:');
      console.log('   ID:', admin.id);
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
    } else {
      console.log('❌ Not found in Admin table');
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserTables(); 