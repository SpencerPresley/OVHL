import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface TeamStats {
  teamSeasonId: string;
  teamName: string;
  teamAbbreviation: string;
  logoPath: string | null;
  gamesPlayed: number;
  wins: number;
  losses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const leagueShortName = resolvedParams.id.toLowerCase();

    const league = await prisma.league.findUnique({
      where: { shortName: leagueShortName },
    });

    if (!league) {
      return NextResponse.json(
        { error: `League with short name '${leagueShortName}' not found` },
        { status: 404 }
      );
    }

    const latestSeason = await prisma.season.findFirst({
      where: { isLatest: true },
      orderBy: { seasonNumber: 'desc' },
    });

    if (!latestSeason) {
      return NextResponse.json({ error: 'No active season found' }, { status: 404 });
    }

    const leagueSeason = await prisma.leagueSeason.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId: league.id,
          seasonId: latestSeason.id,
        },
      },
    });

    if (!leagueSeason) {
      return NextResponse.json(
        { error: `LeagueSeason not found for ${league.name} in season ${latestSeason.seasonNumber}` },
        { status: 404 }
      );
    }

    const teamSeasonsWithData = await prisma.teamSeason.findMany({
      where: {
        leagueSeasonId: leagueSeason.id,
      },
      include: {
        team: {
          include: {
            division: true,
          },
        },
        matches: {
          include: {
            clubAggregateMatchStats: true,
          },
        },
      },
    });

    console.log(`Found ${teamSeasonsWithData.length} TeamSeasons for LeagueSeason ${leagueSeason.id}`);

    const calculatedStats = new Map<string, TeamStats>();

    for (const ts of teamSeasonsWithData) {
      let stats: TeamStats = {
        teamSeasonId: ts.id,
        teamName: ts.team.fullTeamName,
        teamAbbreviation: ts.team.teamAbbreviation,
        logoPath: ts.team.logoPath ?? null,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifferential: 0,
      };

      for (const match of ts.matches) {
        if (match.clubAggregateMatchStats.length !== 2) {
          console.warn(`Match ${match.id} does not have exactly 2 ClubAggregateMatchStats records. Skipping.`);
          continue;
        }

        const teamEAIdentifier = ts.team.eaClubId;
        if (!teamEAIdentifier) {
          console.warn(`TeamSeason ${ts.id} missing EA identifier (e.g., eaClubId) needed for matching. Skipping matches for this team.`);
          break;
        }

        const teamAggStat = match.clubAggregateMatchStats.find(
          (aggStat) => aggStat.eaTeamId.toString() === teamEAIdentifier
        );

        if (!teamAggStat) {
          console.warn(`Could not find ClubAggregateMatchStats for team EA ID ${teamEAIdentifier} in Match ${match.id}`);
          continue;
        }

        stats.gamesPlayed++;
        const goalsFor = teamAggStat.score;
        const goalsAgainst = teamAggStat.opponentScore;

        if (goalsFor > goalsAgainst) {
          stats.wins++;
          stats.points += 2;
        } else if (goalsFor < goalsAgainst) {
          stats.losses++;
        } else {
          console.warn(`Match ${match.id} resulted in a tie (${goalsFor}-${goalsAgainst}). Points logic might need adjustment.`);
        }

        stats.goalsFor += goalsFor;
        stats.goalsAgainst += goalsAgainst;
      }

      stats.points = stats.wins * 2;
      stats.goalDifferential = stats.goalsFor - stats.goalsAgainst;

      calculatedStats.set(ts.id, stats);
    }

    const teamsByDivision = new Map<string, TeamStats[]>();

    calculatedStats.forEach((stats, teamSeasonId) => {
      const teamSeasonData = teamSeasonsWithData.find(ts => ts.id === teamSeasonId);
      const divisionName = teamSeasonData?.team?.division?.name ?? 'Unknown Division';

      if (!teamsByDivision.has(divisionName)) {
        teamsByDivision.set(divisionName, []);
      }
      teamsByDivision.get(divisionName)?.push(stats);
    });

    teamsByDivision.forEach((teams) => {
      teams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.goalDifferential !== a.goalDifferential) return b.goalDifferential - a.goalDifferential;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      });
    });

    const standings = Array.from(teamsByDivision.entries()).map(([division, teams]) => ({
      division,
      teams,
    }));

    standings.sort((a, b) => a.division.localeCompare(b.division));

    return NextResponse.json({
      standings,
    });
  } catch (error) {
    console.error('Failed to fetch standings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch standings';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

