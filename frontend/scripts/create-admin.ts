import { PrismaClient, System } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'spencerpresley96@gmail.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin', 10);
    const admin = await prisma.user.create({
      data: {
        email: 'spencerpresley96@gmail.com',
        username: 'admin',
        password: hashedPassword,
        isAdmin: true,
      },
    });

    // Create player record for admin
    const player = await prisma.player.create({
      data: {
        id: admin.id,
        ea_id: 'EA_ADMIN',
        name: 'Admin',
        activeSystem: System.PS,
      },
    });

    // Create gamertag history
    await prisma.gamertagHistory.create({
      data: {
        playerId: player.id,
        system: System.PS,
        gamertag: 'AdminGT',
      },
    });

    console.log('Admin user and player created successfully:', {
      userId: admin.id,
      playerId: player.id,
    });
  } catch (error) {
    console.error('Failed to create admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
