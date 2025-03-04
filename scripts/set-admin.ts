import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdminStatus() {
  // Get email from command line arguments
  const email = process.argv[2];
  const adminArgProvided = process.argv.length > 3;
  const isAdmin = process.argv[3] === 'true';

  if (!email) {
    console.error('Error: Email is required.');
    console.log('Usage: npx ts-node scripts/set-admin.ts <email> [true|false]');
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
        isAdmin: true,
      },
    });

    if (!user) {
      console.log(`User with email ${email} not found.`);
      process.exit(1);
    }

    console.log('\nCurrent user details:');
    console.log('-'.repeat(50));
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Name: ${user.name || 'N/A'}`);
    console.log(`Username: ${user.username || 'N/A'}`);
    console.log(`Admin Status: ${user.isAdmin ? 'YES' : 'NO'}`);
    console.log('-'.repeat(50));

    // If isAdmin argument is not provided, toggle the current status
    // Otherwise use the provided value
    const newAdminStatus = adminArgProvided ? isAdmin : !user.isAdmin;

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: newAdminStatus },
      select: {
        email: true,
        isAdmin: true,
      },
    });

    if (newAdminStatus) {
      console.log(`✅ Admin privileges GRANTED to ${updatedUser.email}`);
    } else {
      console.log(`❌ Admin privileges REVOKED from ${updatedUser.email}`);
    }

    console.log(`User's admin status is now: ${updatedUser.isAdmin ? 'YES' : 'NO'}`);
  } catch (error) {
    console.error('Error updating admin status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdminStatus().catch(async (error) => {
  console.error('Error in script:', error);
  await prisma.$disconnect();
  process.exit(1);
}); 