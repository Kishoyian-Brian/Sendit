const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminInAdminTable() {
  try {
    const email = 'kishoyianbrianmwangi@gmail.com';
    const name = 'Brian Mwangi';
    const password = 'brian123';

    // Check if admin already exists in Admin table
    const existing = await prisma.admin.findUnique({ 
      where: { email } 
    });
    
    if (existing) {
      console.log('✅ Admin already exists in Admin table:', email);
      console.log('   ID:', existing.id);
      return;
    }

    // Create admin user in Admin table
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: { 
        email, 
        name, 
        password: hashedPassword
      },
    });
    
    console.log('✅ Admin created successfully in Admin table:');
    console.log('   ID:', admin.id);
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.name);

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminInAdminTable(); 