const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'testuser@gmail.com';
    const name = 'Test User';
    const phone = '0712345678';
    const password = 'test123';

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('✅ Test user already exists:', email);
      console.log('   ID:', existing.id);
      console.log('   Role:', existing.role);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        role: 'USER'
      },
    });

    console.log('✅ Test user created successfully:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Phone:', user.phone);
    console.log('   Role:', user.role);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 