const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestDriver() {
  try {
    const email = 'driver@gmail.com';
    const name = 'Test Driver';
    const phone = '0712345678';
    const password = 'driver123';

    // Check if driver already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('✅ Test driver already exists:', email);
      console.log('   ID:', existing.id);
      console.log('   Role:', existing.role);
      return;
    }

    // Create test driver
    const hashedPassword = await bcrypt.hash(password, 10);
    const driver = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        role: 'DRIVER'
      },
    });

    console.log('✅ Test driver created successfully:');
    console.log('   ID:', driver.id);
    console.log('   Email:', driver.email);
    console.log('   Name:', driver.name);
    console.log('   Phone:', driver.phone);
    console.log('   Role:', driver.role);

  } catch (error) {
    console.error('❌ Error creating test driver:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDriver(); 