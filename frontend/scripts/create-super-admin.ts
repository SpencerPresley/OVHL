import { PrismaClient, System } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

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
        isAdmin: true,
      },
    });

    // UPDATE User with player-related info
    const updatedAdmin = await prisma.user.update({
        where: { id: superAdmin.id },
        data: {
            currentEaId: 'Cokenetsxv', // Set EA ID on User
            activeSystem: System.PS,   // Set active system on User
        }
    });

    // Create gamertag history - Link via userId
    await prisma.gamertagHistory.create({
      data: {
        userId: superAdmin.id, // CORRECTED: Use userId
        system: System.PS,
        gamertag: 'Cokenetsxv',
        isVerified: true, // Set as verified since it's the admin
        verifiedAt: new Date(),
        // No verification code needed
      },
    });

    console.log('Super Admin user created and configured successfully:', {
      userId: updatedAdmin.id,
      email: updatedAdmin.email,
      currentEaId: updatedAdmin.currentEaId,
      activeSystem: updatedAdmin.activeSystem
    });
  } catch (error) {
    console.error('Failed to create super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
