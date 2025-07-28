import { PrismaClient } from './generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminIfNotExists() {
  const email = 'kishoyianbrianmwangi@gmail.com';
  const name = 'Brian Mwangi';
  const password = 'brian123';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists:', email);
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.admin.create({
    data: { email, name, password: hashed },
  });
  console.log('Admin created:', admin);
}

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

createAdminIfNotExists().then(() => checkAdmin()); 