import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function verifyAuth(token: string) {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = verify(token, secret) as { id: string };
    if (!decoded?.id) {
      return null;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        isAdmin: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error verifying auth:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
} 