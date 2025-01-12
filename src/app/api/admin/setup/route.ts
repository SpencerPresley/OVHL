import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SUPER_ADMIN_EMAIL = "spencerpresley96@gmail.com";

export async function POST(request: Request) {
  try {
    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { message: "Super admin already exists" },
        { status: 400 },
      );
    }

    // Create super admin user
    const hashedPassword = await bcrypt.hash("admin", 10); // You'll change this password on first login
    
    const superAdmin = await prisma.user.create({
      data: {
        email: SUPER_ADMIN_EMAIL,
        username: "admin",
        password: hashedPassword,
        isAdmin: true,
      },
    });

    return NextResponse.json({
      message: "Super admin created successfully",
      userId: superAdmin.id,
    });
  } catch (error) {
    console.error("Failed to create super admin:", error);
    return NextResponse.json(
      { error: "Failed to create super admin" },
      { status: 500 },
    );
  }
} 