'use client';

import { LeagueNav } from '@/components/league-nav';
import { System, TeamManagementRole } from '@prisma/client';

// Components
import { TeamBanner } from './components/team-banner';
import { Content } from './components/content';

// Utilities
import { processPlayerData } from './utils/player-processing';
import { calculateTeamSalaryFromValues } from '../utils/salary-utils';

interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

interface Manager {
  role: TeamManagementRole;
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    player: {
      id: string;
      gamertags: {
        gamertag: string;
      }[];
    } | null;
  };
}

interface Team {
  id: string;
  officialName: string;
  managers: Manager[];
}

interface PlayerSeasonData {
  playerSeason: {
    player: {
      id: string;
      name: string;
      activeSystem: System;
      gamertags: {
        gamertag: string;
      }[];
      user?: {
        id: string;
      };
    };
    position: string;
    contract: {
      amount: number;
    };
  };
  gamesPlayed: number;
  goals: number;
  assists: number;
  plusMinus: number;
}

interface TeamSeason {
  players: PlayerSeasonData[];
  tier: {
    salaryCap: number;
  };
  wins: number;
  losses: number;
  otLosses: number;
}

interface TeamDisplayProps {
  league: League;
  team: Team;
  teamSeason: TeamSeason;
  managers: Manager[];
}

export function TeamDisplay({ league, team, teamSeason, managers }: TeamDisplayProps) {
  // Process players into position groups
  const players = processPlayerData(teamSeason.players, managers);
  const USE_DEBUG_LOG = false;
  // Debug logs
  if (USE_DEBUG_LOG) {
    console.log(
      'All players with positions:',
      players.map((p) => ({ name: p.name, position: p.position }))
    );
  }

  // Filter players by position
  const forwards = players.filter((p) => ['C', 'LW', 'RW'].includes(p.position));
  const defense = players.filter((p) => ['LD', 'RD'].includes(p.position));
  const goalies = players.filter((p) => p.position === 'G');

  // Debug logs
  if (USE_DEBUG_LOG) {
    console.log(
      'Forwards:',
      forwards.map((p) => ({ name: p.name, position: p.position }))
    );
    console.log(
      'Defense:',
      defense.map((p) => ({ name: p.name, position: p.position }))
    );
    console.log(
      'Goalies:',
      goalies.map((p) => ({ name: p.name, position: p.position }))
    );
  }

  // Calculate team record and salary
  const teamRecord = `${teamSeason.wins}-${teamSeason.losses}-${teamSeason.otLosses}`;
  const points = teamSeason.wins * 2 + teamSeason.otLosses;

  const { totalSalary, salaryCap, salaryColor } = calculateTeamSalaryFromValues(
    players.reduce((total, player) => total + player.contract.amount, 0),
    teamSeason.tier?.salaryCap ?? 0
  );

  // Debug log for salary data
  if (USE_DEBUG_LOG) {
    console.log('Salary Data:', {
      totalSalary,
      salaryCap,
      tier: teamSeason.tier,
      players: players.map((p) => ({
        name: p.name,
        contractAmount: p.contract.amount,
      })),
    });
  }

  return (
    <div className="min-h-screen">
      <TeamBanner
        league={league}
        teamName={team.officialName}
        record={teamRecord}
        points={points}
        totalSalary={totalSalary}
        salaryCap={salaryCap}
        salaryColor={salaryColor}
      />

      <LeagueNav leagueId={league.id} />

      <div className="container mx-auto px-4 py-8">
        <Content 
          managers={managers} 
          forwards={forwards} 
          defense={defense} 
          goalies={goalies} 
        />
      </div>
    </div>
  );
}
