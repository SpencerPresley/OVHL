import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
      isAdmin?: boolean;
    };

    // Verify admin status
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user?.isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    // Get all teams with their affiliations
    const teams = await prisma.team.findMany({
      include: {
        nhlAffiliate: {
          select: {
            id: true,
            officialName: true,
            teamIdentifier: true,
          },
        },
        ahlAffiliate: {
          select: {
            id: true,
            officialName: true,
            teamIdentifier: true,
          },
        },
      },
      orderBy: [
        { nhlAffiliateId: 'asc' },
        { ahlAffiliateId: 'asc' },
        { officialName: 'asc' },
      ],
    });

    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Failed to fetch teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
} 