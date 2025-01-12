import React from "react";
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { UserProfileView } from "./user-profile-view";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const id = await params.id;
  
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      player: {
        include: {
          gamertags: {
            orderBy: { createdAt: 'desc' },
            take: 1
          },
          seasons: {
            include: {
              teamSeasons: {
                select: {
                  teamSeason: {
                    include: {
                      team: {
                        select: {
                          id: true,
                          officialName: true,
                          teamIdentifier: true,
                          createdAt: true,
                          updatedAt: true,
                          ahlAffiliateId: true,
                        },
                      },
                      tier: {
                        select: {
                          name: true,
                        },
                      },
                    }
                  },
                  gamesPlayed: true,
                  goals: true,
                  assists: true,
                  plusMinus: true,
                  shots: true,
                  hits: true,
                  takeaways: true,
                  giveaways: true,
                  penaltyMinutes: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!user) {
    notFound();
  }

  return <UserProfileView user={user} />;
} 