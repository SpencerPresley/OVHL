import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verify(token.value, process.env.JWT_SECRET!) as {
      id: string;
    };

    // Get params.id safely by awaiting the context
    const { id } = await context.params;

    // Verify the notification belongs to the user
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.userId !== decoded.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    return NextResponse.json({ notification: updatedNotification });
  } catch (error) {
    console.error("Failed to archive notification:", error);
    return NextResponse.json(
      { error: "Failed to archive notification" },
      { status: 500 }
    );
  }
} 