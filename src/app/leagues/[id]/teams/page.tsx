import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { TeamsDisplay } from './teams-display';

const prisma = new PrismaClient();

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

const leagues: Record<string, League> = {
  nhl: {
    id: 'nhl',
    name: 'NHL',
    logo: '/nhl_logo.png',
    bannerColor: 'bg-blue-900',
  },
  ahl: {
    id: 'ahl',
    name: 'AHL',
    logo: '/ahl_logo.png',
    bannerColor: 'bg-yellow-400',
  },
  echl: {
    id: 'echl',
    name: 'ECHL',
    logo: '/echl_logo.png',
    bannerColor: 'bg-emerald-600',
  },
  chl: {
    id: 'chl',
    name: 'CHL',
    logo: '/chl_logo.png',
    bannerColor: 'bg-teal-600',
  },
};

export default async function TeamsPage({ params }: { params: { id: string } }) {
  const parameters = await params;
  const league = leagues[parameters.id.toLowerCase()];
  if (!league) {
    notFound();
  }

  // Get the latest season
  const season = await prisma.season.findFirst({
    where: { isLatest: true },
  });

  if (!season) {
    notFound();
  }

  // Get all teams in this league
  const tier = await prisma.tier.findFirst({
    where: {
      seasonId: season.id,
      name: league.id.toUpperCase(),
    },
    include: {
      teams: {
        include: {
          team: {
            include: {
              managers: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      username: true,
                      player: {
                        include: {
                          gamertags: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          players: {
            include: {
              playerSeason: {
                include: {
                  player: {
                    include: {
                      user: true,
                      gamertags: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                      },
                    },
                  },
                  contract: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!tier) {
    notFound();
  }

  // Debug log for tier data
  console.log('Tier Data:', {
    name: tier.name,
    salaryCap: tier.salaryCap,
    teamsCount: tier.teams.length
  });

  // Map the data structure to match what TeamsDisplay expects
  const teams = tier.teams.map((teamSeason) => {
    // Debug log for team season data
    console.log('Team Season Data:', {
      teamName: teamSeason.team.officialName,
      salaryCap: tier.salaryCap,
      players: teamSeason.players.map(p => ({
        name: p.playerSeason.player.name,
        contract: p.playerSeason.contract.amount
      }))
    });

    return {
      team: {
        id: teamSeason.team.id,
        officialName: teamSeason.team.officialName,
        teamIdentifier: teamSeason.team.teamIdentifier,
        managers: teamSeason.team.managers
      },
      tier: {
        salaryCap: tier.salaryCap
      },
      wins: teamSeason.wins || 0,
      losses: teamSeason.losses || 0,
      otLosses: teamSeason.otLosses || 0,
      players: teamSeason.players.map(player => {
        return {
          playerSeason: {
            player: {
              id: player.playerSeason.player.id,
              name: player.playerSeason.player.name,
              user: {
                id: player.playerSeason.player.user.id
              },
              gamertags: player.playerSeason.player.gamertags.map(gt => ({
                gamertag: gt.gamertag,
                system: gt.system
              }))
            },
            position: player.playerSeason.position,
            contract: player.playerSeason.contract
          },
          gamesPlayed: player.gamesPlayed,
          goals: player.goals,
          assists: player.assists,
          plusMinus: player.plusMinus,
          goalsAgainst: player.goalsAgainst,
          saves: player.saves
        };
      })
    };
  });

  // Debug log for final mapped data
  console.log('Final Teams Data:', teams.map(t => ({
    teamName: t.team.officialName,
    salaryCap: t.tier.salaryCap,
    totalSalary: t.players.reduce((sum, p) => sum + p.playerSeason.contract.amount, 0)
  })));

  return <TeamsDisplay league={league} teams={teams} />;
}
