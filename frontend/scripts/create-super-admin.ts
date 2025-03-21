import { PrismaClient, System } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: 'spencerpresley96@gmail.com' },
    });

    if (existingSuperAdmin) {
      console.log('Super Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin', 10);
    const superAdmin = await prisma.user.create({
      data: {
        email: 'spencerpresley96@gmail.com',
        username: 'superadmin',
        name: 'Super Admin',
        password: hashedPassword,
        isSuperAdmin: true,
      },
    });

    // Create player record for admin
    const player = await prisma.player.create({
      data: {
        id: superAdmin.id,
        ea_id: 'Cokenetsxv',
        name: 'Cokenetsxv',
        activeSystem: System.PS,
      },
    });

    // Create gamertag history
    await prisma.gamertagHistory.create({
      data: {
        playerId: player.id,
        system: System.PS,
        gamertag: 'Cokenetsxv',
        // No verification data needed for admin user
      },
    });

    console.log('Super Admin user and player created successfully:', {
      userId: superAdmin.id,
      playerId: player.id,
    });
  } catch (error) {
    console.error('Failed to create super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
