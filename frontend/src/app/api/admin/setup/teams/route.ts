import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';
import { NHLConference, NHLDivision } from '@/lib/teams/types';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Step 1: Create Leagues
    const nhlLeague = await prisma.league.upsert({
      where: { shortName: 'NHL' },
      create: {
        name: 'National Hockey League',
        shortName: 'NHL',
        leagueType: 'NHL',
        isSubLeague: false,
      },
      update: {},
    });

    const ahlLeague = await prisma.league.upsert({
      where: { shortName: 'AHL' },
      create: {
        name: 'American Hockey League',
        shortName: 'AHL',
        leagueType: 'AHL',
        isSubLeague: false,
      },
      update: {},
    });

    const echlLeague = await prisma.league.upsert({
      where: { shortName: 'ECHL' },
      create: {
        name: 'East Coast Hockey League',
        shortName: 'ECHL',
        leagueType: 'ECHL',
        isSubLeague: false,
      },
      update: {},
    });

    const chlLeague = await prisma.league.upsert({
      where: { shortName: 'CHL' },
      create: {
        name: 'Canadian Hockey League',
        shortName: 'CHL',
        leagueType: 'CHL',
        isSubLeague: false,
      },
      update: {},
    });

    // Step 2: Create Sub-leagues for CHL
    const ohlLeague = await prisma.league.upsert({
      where: { shortName: 'OHL' },
      create: {
        name: 'Ontario Hockey League',
        shortName: 'OHL',
        leagueType: 'CHL',
        isSubLeague: true,
        parentLeagueId: chlLeague.id,
      },
      update: {
        parentLeagueId: chlLeague.id,
      },
    });

    const qmjhlLeague = await prisma.league.upsert({
      where: { shortName: 'QMJHL' },
      create: {
        name: 'Quebec Major Junior Hockey League',
        shortName: 'QMJHL',
        leagueType: 'CHL',
        isSubLeague: true,
        parentLeagueId: chlLeague.id,
      },
      update: {
        parentLeagueId: chlLeague.id,
      },
    });

    const whlLeague = await prisma.league.upsert({
      where: { shortName: 'WHL' },
      create: {
        name: 'Western Hockey League',
        shortName: 'WHL',
        leagueType: 'CHL',
        isSubLeague: true,
        parentLeagueId: chlLeague.id,
      },
      update: {
        parentLeagueId: chlLeague.id,
      },
    });

    // Step 3: Create NHL Conferences
    const easternConference = await prisma.conference.upsert({
      where: { 
        name_leagueId: {
          name: 'Eastern',
          leagueId: nhlLeague.id,
        }
      },
      create: {
        name: 'Eastern',
        displayOrder: 1,
        leagueId: nhlLeague.id,
      },
      update: {
        displayOrder: 1,
      },
    });

    const westernConference = await prisma.conference.upsert({
      where: { 
        name_leagueId: {
          name: 'Western',
          leagueId: nhlLeague.id,
        }
      },
      create: {
        name: 'Western',
        displayOrder: 2,
        leagueId: nhlLeague.id,
      },
      update: {
        displayOrder: 2,
      },
    });

    // Step 4: Create NHL Divisions
    const atlanticDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Atlantic',
          leagueId: nhlLeague.id,
        }
      },
      create: {
        name: 'Atlantic',
        displayOrder: 1,
        conferenceId: easternConference.id,
        leagueId: nhlLeague.id,
      },
      update: {
        displayOrder: 1,
        conferenceId: easternConference.id,
      },
    });

    const metropolitanDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Metropolitan',
          leagueId: nhlLeague.id,
        }
      },
      create: {
        name: 'Metropolitan',
        displayOrder: 2,
        conferenceId: easternConference.id,
        leagueId: nhlLeague.id,
      },
      update: {
        displayOrder: 2,
        conferenceId: easternConference.id,
      },
    });

    const centralDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Central',
          leagueId: nhlLeague.id,
        }
      },
      create: {
        name: 'Central',
        displayOrder: 3,
        conferenceId: westernConference.id,
        leagueId: nhlLeague.id,
      },
      update: {
        displayOrder: 3,
        conferenceId: westernConference.id,
      },
    });

    const pacificDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Pacific',
          leagueId: nhlLeague.id,
        }
      },
      create: {
        name: 'Pacific',
        displayOrder: 4,
        conferenceId: westernConference.id,
        leagueId: nhlLeague.id,
      },
      update: {
        displayOrder: 4,
        conferenceId: westernConference.id,
      },
    });

    // Create maps to help with division lookup
    const nhlDivisionMap = {
      [NHLDivision.ATLANTIC]: atlanticDivision.id,
      [NHLDivision.METROPOLITAN]: metropolitanDivision.id,
      [NHLDivision.CENTRAL]: centralDivision.id,
      [NHLDivision.PACIFIC]: pacificDivision.id,
    };

    // Step 5: Create AHL Conferences and Divisions
    const ahlEasternConference = await prisma.conference.upsert({
      where: { 
        name_leagueId: {
          name: 'Eastern',
          leagueId: ahlLeague.id,
        }
      },
      create: {
        name: 'Eastern',
        displayOrder: 1,
        leagueId: ahlLeague.id,
      },
      update: {
        displayOrder: 1,
      },
    });

    const ahlWesternConference = await prisma.conference.upsert({
      where: { 
        name_leagueId: {
          name: 'Western',
          leagueId: ahlLeague.id,
        }
      },
      create: {
        name: 'Western',
        displayOrder: 2,
        leagueId: ahlLeague.id,
      },
      update: {
        displayOrder: 2,
      },
    });

    // Create AHL Divisions
    const ahlAtlanticDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Atlantic',
          leagueId: ahlLeague.id,
        }
      },
      create: {
        name: 'Atlantic',
        displayOrder: 1,
        conferenceId: ahlEasternConference.id,
        leagueId: ahlLeague.id,
      },
      update: {
        displayOrder: 1,
        conferenceId: ahlEasternConference.id,
      },
    });

    const ahlNorthDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'North',
          leagueId: ahlLeague.id,
        }
      },
      create: {
        name: 'North',
        displayOrder: 2,
        conferenceId: ahlEasternConference.id,
        leagueId: ahlLeague.id,
      },
      update: {
        displayOrder: 2,
        conferenceId: ahlEasternConference.id,
      },
    });

    const ahlCentralDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Central',
          leagueId: ahlLeague.id,
        }
      },
      create: {
        name: 'Central',
        displayOrder: 3,
        conferenceId: ahlWesternConference.id,
        leagueId: ahlLeague.id,
      },
      update: {
        displayOrder: 3,
        conferenceId: ahlWesternConference.id,
      },
    });

    const ahlPacificDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Pacific',
          leagueId: ahlLeague.id,
        }
      },
      create: {
        name: 'Pacific',
        displayOrder: 4,
        conferenceId: ahlWesternConference.id,
        leagueId: ahlLeague.id,
      },
      update: {
        displayOrder: 4,
        conferenceId: ahlWesternConference.id,
      },
    });

    // Create map for AHL divisions
    const ahlDivisionMap = {
      'ATLANTIC': ahlAtlanticDivision.id,
      'NORTH': ahlNorthDivision.id,
      'CENTRAL': ahlCentralDivision.id,
      'PACIFIC': ahlPacificDivision.id,
    };

    // Step 6: Create ECHL Conferences and Divisions
    const echlEasternConference = await prisma.conference.upsert({
      where: { 
        name_leagueId: {
          name: 'Eastern',
          leagueId: echlLeague.id,
        }
      },
      create: {
        name: 'Eastern',
        displayOrder: 1,
        leagueId: echlLeague.id,
      },
      update: {
        displayOrder: 1,
      },
    });

    const echlWesternConference = await prisma.conference.upsert({
      where: { 
        name_leagueId: {
          name: 'Western',
          leagueId: echlLeague.id,
        }
      },
      create: {
        name: 'Western',
        displayOrder: 2,
        leagueId: echlLeague.id,
      },
      update: {
        displayOrder: 2,
      },
    });

    // Create ECHL Divisions
    const echlNorthDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'North',
          leagueId: echlLeague.id,
        }
      },
      create: {
        name: 'North',
        displayOrder: 1,
        conferenceId: echlEasternConference.id,
        leagueId: echlLeague.id,
      },
      update: {
        displayOrder: 1,
        conferenceId: echlEasternConference.id,
      },
    });

    const echlSouthDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'South',
          leagueId: echlLeague.id,
        }
      },
      create: {
        name: 'South',
        displayOrder: 2,
        conferenceId: echlEasternConference.id,
        leagueId: echlLeague.id,
      },
      update: {
        displayOrder: 2,
        conferenceId: echlEasternConference.id,
      },
    });

    const echlCentralDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Central',
          leagueId: echlLeague.id,
        }
      },
      create: {
        name: 'Central',
        displayOrder: 3,
        conferenceId: echlWesternConference.id,
        leagueId: echlLeague.id,
      },
      update: {
        displayOrder: 3,
        conferenceId: echlWesternConference.id,
      },
    });

    const echlMountainDivision = await prisma.division.upsert({
      where: { 
        name_leagueId: {
          name: 'Mountain',
          leagueId: echlLeague.id,
        }
      },
      create: {
        name: 'Mountain',
        displayOrder: 4,
        conferenceId: echlWesternConference.id,
        leagueId: echlLeague.id,
      },
      update: {
        displayOrder: 4,
        conferenceId: echlWesternConference.id,
      },
    });

    // Create map for ECHL divisions
    const echlDivisionMap = {
      'NORTH': echlNorthDivision.id,
      'SOUTH': echlSouthDivision.id,
      'CENTRAL': echlCentralDivision.id,
      'MOUNTAIN': echlMountainDivision.id,
    };

    // Step 7: Create Teams with references to the correct league, conference, and division
    // Create NHL Teams
    const nhlTeamsCreated = await Promise.all(
      NHL_TEAMS.map(async (team) => {
        return await prisma.team.upsert({
          where: { 
            teamAbbreviation_leagueId: {
              teamAbbreviation: team.abbreviation,
              leagueId: nhlLeague.id,
            }
          },
          create: {
            eaClubId: '',
            eaClubName: '',
            fullTeamName: team.name,
            teamAbbreviation: team.abbreviation,
            divisionId: nhlDivisionMap[team.division],
            leagueId: nhlLeague.id,
            primaryColor: team.colors.primary,
            secondaryColor: team.colors.secondary,
            logoPath: team.logo_path || null,
          },
          update: {
            fullTeamName: team.name,
            divisionId: nhlDivisionMap[team.division],
            primaryColor: team.colors.primary,
            secondaryColor: team.colors.secondary,
            logoPath: team.logo_path || null,
          },
        });
      })
    );

    // Create AHL Teams with NHL Affiliations
    const ahlTeamsCreated = await Promise.all(
      AHL_TEAMS.map(async (team) => {
        const nhlTeam = team.nhlTeamId
          ? nhlTeamsCreated.find((t) => t.teamAbbreviation === team.nhlTeamId.split('_')[1].toUpperCase())
          : null;

        return await prisma.team.upsert({
          where: { 
            teamAbbreviation_leagueId: {
              teamAbbreviation: team.abbreviation,
              leagueId: ahlLeague.id,
            }
          },
          create: {
            eaClubId: '',
            eaClubName: '',
            fullTeamName: team.name,
            teamAbbreviation: team.abbreviation,
            divisionId: ahlDivisionMap[team.division],
            leagueId: ahlLeague.id,
            nhlAffiliateId: nhlTeam?.id,
            primaryColor: team.colors.primary,
            secondaryColor: team.colors.secondary,
            logoPath: team.logo_path || null,
          },
          update: {
            fullTeamName: team.name,
            divisionId: ahlDivisionMap[team.division],
            nhlAffiliateId: nhlTeam?.id,
            primaryColor: team.colors.primary,
            secondaryColor: team.colors.secondary,
            logoPath: team.logo_path || null,
          },
        });
      })
    );

    // Create ECHL Teams with NHL and AHL Affiliations
    await Promise.all(
      ECHL_TEAMS.map(async (team) => {
        const nhlTeam = team.nhlTeamId
          ? nhlTeamsCreated.find((t) => t.teamAbbreviation === team.nhlTeamId.split('_')[1].toUpperCase())
          : null;

        const ahlTeam = team.ahlTeamId
          ? ahlTeamsCreated.find((t) => t.teamAbbreviation === team.ahlTeamId.split('_')[1].toUpperCase())
          : null;

        return await prisma.team.upsert({
          where: { 
            teamAbbreviation_leagueId: {
              teamAbbreviation: team.abbreviation,
              leagueId: echlLeague.id,
            }
          },
          create: {
            eaClubId: '',
            eaClubName: '',
            fullTeamName: team.name,
            teamAbbreviation: team.abbreviation,
            divisionId: echlDivisionMap[team.division],
            leagueId: echlLeague.id,
            nhlAffiliateId: nhlTeam?.id,
            ahlAffiliateId: ahlTeam?.id,
            primaryColor: team.colors.primary,
            secondaryColor: team.colors.secondary,
            logoPath: team.logo_path || null,
          },
          update: {
            fullTeamName: team.name,
            divisionId: echlDivisionMap[team.division],
            nhlAffiliateId: nhlTeam?.id,
            ahlAffiliateId: ahlTeam?.id,
            primaryColor: team.colors.primary,
            secondaryColor: team.colors.secondary,
            logoPath: team.logo_path || null,
          },
        });
      })
    );

    // Create CHL Teams (using their specific leagues)
    await Promise.all(
      CHL_TEAMS.map(async (team) => {
        // Determine which sub-league this team belongs to
        let leagueForTeam;
        if (team.league === 'OHL') {
          leagueForTeam = ohlLeague;
        } else if (team.league === 'QMJHL') {
          leagueForTeam = qmjhlLeague;
        } else if (team.league === 'WHL') {
          leagueForTeam = whlLeague;
        } else {
          leagueForTeam = chlLeague;
        }

        return await prisma.team.upsert({
          where: { 
            teamAbbreviation_leagueId: {
              teamAbbreviation: team.abbreviation,
              leagueId: leagueForTeam.id,
            }
          },
          create: {
            eaClubId: '',
            eaClubName: '',
            fullTeamName: team.name,
            teamAbbreviation: team.abbreviation,
            leagueId: leagueForTeam.id,
            primaryColor: team.colors.primary,
            secondaryColor: team.colors.secondary,
            logoPath: team.logo_path || null,
          },
          update: {
            fullTeamName: team.name,
            primaryColor: team.colors.primary,
            secondaryColor: team.colors.secondary,
            logoPath: team.logo_path || null,
          },
        });
      })
    );

    return NextResponse.json({
      message: 'Teams setup completed successfully',
    });
  } catch (error) {
    console.error('Failed to setup teams:', error);
    return NextResponse.json({ error: 'Failed to setup teams' }, { status: 500 });
  }
}
