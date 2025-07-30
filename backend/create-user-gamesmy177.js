const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUserGamesmy177() {
  try {
    const email = 'gamesmy177@gmail.com';
    const name = 'Games My';
    const phone = '0712345678';
    const password = 'password123';

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      console.log('✅ User already exists:', email);
      console.log('   ID:', existing.id);
      console.log('   Name:', existing.name);
      console.log('   Role:', existing.role);
      return;
    }

    // Create user
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

    console.log('✅ User created successfully:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Phone:', user.phone);
    console.log('   Role:', user.role);
    console.log('   Password:', password);

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUserGamesmy177(); 