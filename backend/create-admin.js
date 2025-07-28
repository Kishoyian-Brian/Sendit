const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = 'kishoyianbrianmwangi@gmail.com';
    const name = 'Brian Mwangi';
    const password = 'brian123';
    const phone = '+254700000000';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      console.log('✅ Admin already exists:', email);
      console.log('   ID:', existing.id);
      console.log('   Role:', existing.role);
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.user.create({
      data: { 
        email, 
        name, 
        phone,
        password: hashedPassword,
        role: 'ADMIN'
      },
    });
    
    console.log('✅ Admin created successfully:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);
    console.log('   Role:', admin.role);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 