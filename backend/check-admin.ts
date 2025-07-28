import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.admin.findUnique({ 
      where: { email: 'admin@sendit.com' } 
    });
    
    if (admin) {
      console.log('✅ Admin found:');
      console.log('   ID:', admin.id);
      console.log('   Email:', admin.email);
      console.log('   Name:', admin.name);
      console.log('   Password hash:', admin.password.substring(0, 20) + '...');
    } else {
      console.log('❌ Admin not found');
    }

    const users = await prisma.user.findMany();
    console.log('\n📊 Users in database:', users.length);
    
    const admins = await prisma.admin.findMany();
    console.log('📊 Admins in database:', admins.length);
    
    const drivers = await prisma.driver.findMany();
    console.log('📊 Drivers in database:', drivers.length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin(); 