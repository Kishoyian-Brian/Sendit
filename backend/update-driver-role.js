const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDriverRole() {
  try {
    const email = 'driver@gmail.com';
    
    // Update the user to have DRIVER role
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'DRIVER' }
    });

    console.log('✅ Driver role updated successfully:');
    console.log('   ID:', updatedUser.id);
    console.log('   Email:', updatedUser.email);
    console.log('   Name:', updatedUser.name);
    console.log('   Role:', updatedUser.role);

  } catch (error) {
    console.error('❌ Error updating driver role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDriverRole(); 