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

  // Debug log to check contract data
  console.log('Contract Debug:', tier.teams.map(teamSeason => ({
    team: teamSeason.team.officialName,
    players: teamSeason.players.map(p => ({
      name: p.playerSeason.player.name,
      userId: p.playerSeason.player.user.id,
      contract: p.playerSeason.contract,
      managers: teamSeason.team.managers
        .filter(m => m.user.id === p.playerSeason.player.user.id)
        .map(m => ({ role: m.role }))
    }))
  })));

  // Map the data structure to match what TeamsDisplay expects
  const teams = tier.teams.map((teamSeason) => {
    // Debug log for team season data
    console.log('Team Season Players:', JSON.stringify(teamSeason.players.map(p => ({
      playerId: p.playerSeason.player.id,
      contract: p.playerSeason.contract,
      position: p.playerSeason.position
    })), null, 2));

    return {
      team: {
        id: teamSeason.team.id,
        officialName: teamSeason.team.officialName,
        teamIdentifier: teamSeason.team.teamIdentifier,
        managers: teamSeason.team.managers
      },
      wins: teamSeason.wins || 0,
      losses: teamSeason.losses || 0,
      otLosses: teamSeason.otLosses || 0,
      players: teamSeason.players.map(player => {
        // Debug log for individual player contract
        console.log('Player Contract:', {
          playerId: player.playerSeason.player.id,
          playerName: player.playerSeason.player.name,
          contract: player.playerSeason.contract
        });

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
  console.log('Final Teams Data:', JSON.stringify(teams.map(t => ({
    teamName: t.team.officialName,
    players: t.players.map(p => ({
      name: p.playerSeason.player.name,
      contract: p.playerSeason.contract
    }))
  })), null, 2));

  return <TeamsDisplay league={league} teams={teams} />;
}
