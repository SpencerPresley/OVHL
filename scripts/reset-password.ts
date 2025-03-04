import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  // Get email and new password from command line arguments
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error('Error: Email and new password are required.');
    console.log('Usage: npx ts-node scripts/reset-password.ts <email> <new-password>');
    process.exit(1);
  }

  try {
    console.log(`Looking for user with email: ${email}`);
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
      },
    });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    console.log('\nUser found:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name || 'N/A'}`);
    console.log(`Username: ${user.username || 'N/A'}`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`\n✅ Password has been reset for ${email}`);
    console.log(`You can now sign in with the new password.`);
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword().catch(async (error) => {
  console.error('Error in script:', error);
  await prisma.$disconnect();
  process.exit(1);
}); 