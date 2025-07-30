const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('🔍 Checking all users in database...');
    
    // Check all users in User table
    const users = await prisma.user.findMany();
    console.log('\n👥 Users in User table:', users.length);
    users.forEach(user => {
      console.log(`   ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, isVerified: ${user.isVerified}`);
    });
    
    // Check all admins in Admin table
    const admins = await prisma.admin.findMany();
    console.log('\n👑 Admins in Admin table:', admins.length);
    admins.forEach(admin => {
      console.log(`   ID: ${admin.id}, Email: ${admin.email}, Name: ${admin.name}`);
    });

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers(); 