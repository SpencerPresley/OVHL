/**
 * @file teams-display.tsx
 * @author Spencer Presley
 * @version 1.0.0
 * @license Proprietary - Copyright (c) 2025 Spencer Presley
 * @copyright All rights reserved. This code is the exclusive property of Spencer Presley.
 * @notice Unauthorized copying, modification, distribution, or use is strictly prohibited.
 *
 * @description Comprehensive Team Roster and Performance Visualization Component
 * @module components/teams-display
 *
 * @requires react
 * @requires next/image
 * @requires next/link
 * @requires shadcn/ui
 *
 * Teams Display Component for League Management System
 *
 * Features:
 * - Detailed team roster visualization
 * - Position-based player organization
 * - Performance statistics tracking
 * - Responsive and interactive design
 * - Dynamic team and player information display
 *
 * Technical Implementation:
 * - Modular component architecture
 * - Efficient data processing and filtering
 * - Responsive layout with mobile optimization
 * - Advanced state management
 * - Performance-optimized rendering
 *
 * Design Principles:
 * - Clean, intuitive user interface
 * - Comprehensive data representation
 * - Seamless user interaction
 * - Accessibility-focused design
 *
 * Performance Considerations:
 * - Memoization of complex calculations
 * - Lazy loading of heavy components
 * - Efficient re-rendering strategies
 * - Minimal computational overhead
 *
 * @example
 * // Basic usage in a league page
 * <TeamsDisplay
 *   league={leagueData}
 *   teams={teamSeasonData}
 * />
 */

'use client';

import React from 'react';
import { Nav } from '@/components/nav';
import { LeagueNav } from '@/components/league-nav';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { System, TeamManagementRole } from '@prisma/client';

/**
 * League information interface
 */
interface League {
  id: string;
  name: string;
  logo: string;
  bannerColor: string;
}

/**
 * Player information interface including season stats and contract details
 */
interface Player {
  playerSeason: {
    player: {
      id: string;
      name: string;
      gamertags: {
        gamertag: string;
        system: System;
      }[];
    };
    position: string;
    contract: {
      amount: number;
    };
  };
  plusMinus: number;
  goalsAgainst: number | null;
  saves: number | null;
}

/**
 * Manager information interface
 */
interface Manager {
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
  role: TeamManagementRole;
}

/**
 * Team season player information
 */
interface TeamSeasonPlayer {
  playerSeason: {
    player: {
      id: string;
      name: string;
      user: {
        id: string;
      };
      gamertags: {
        gamertag: string;
        system: System;
      }[];
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
  goalsAgainst: number | null;
  saves: number | null;
}

/**
 * Team season information including roster and performance stats
 */
interface TeamSeason {
  team: {
    id: string;
    officialName: string;
    teamIdentifier: string;
    managers: Manager[];
  };
  wins: number;
  losses: number;
  otLosses: number;
  players: TeamSeasonPlayer[];
}

/**
 * Props for the TeamsDisplay component
 */
interface TeamsDisplayProps {
  league: League;
  teams: TeamSeason[];
}

/**
 * Player card interface
 */
interface PlayerCard {
  id: string;
  name: string;
  position: string;
  system: System;
  gamertag: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  plusMinus: number;
  contract: {
    amount: number;
  };
}

/**
 * TeamsDisplay Component
 *
 * Renders a comprehensive view of all teams in a league, including rosters,
 * player stats, and contract information. Features position-based organization
 * and responsive navigation.
 *
 * @param {TeamsDisplayProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
export function TeamsDisplay({ league, teams }: TeamsDisplayProps) {
  // Sort teams alphabetically by name
  const sortedTeams = [...teams].sort((a, b) =>
    a.team.officialName.localeCompare(b.team.officialName)
  );

  const [isMobile, setIsMobile] = React.useState(false);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  // Mobile detection effect
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll position tracking for back-to-top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add debug logging at the start of the component
  React.useEffect(() => {
    teams.forEach(teamSeason => {
      teamSeason.players.forEach(player => {
        console.log('Player Contract Debug:', {
          name: player.playerSeason.player.name,
          contractAmount: player.playerSeason.contract.amount
        });
      });
    });
  }, [teams]);

  /**
   * Filters and sorts players by position
   * @param {TeamSeasonPlayer[]} players - Array of players to filter
   * @param {string[]} positions - Array of positions to filter by
   * @returns {TeamSeasonPlayer[]} Filtered and sorted players
   */
  const getPositionPlayers = (players: TeamSeasonPlayer[], positions: string[]) => {
    return players
      .filter((p) => positions.includes(p.playerSeason.position))
      .sort((a, b) => a.playerSeason.player.name.localeCompare(b.playerSeason.player.name));
  };

  /**
   * Scrolls to a specific team's card
   * @param {string} teamId - ID of the team to scroll to
   */
  const scrollToTeam = (teamId: string) => {
    const element = document.getElementById(teamId);
    if (element) {
      const navHeight = 64; // Main nav height
      const leagueNavHeight = 48; // League nav height
      const teamNavHeight = 48; // Team nav height
      const padding = isMobile ? 80 : -40; // More padding on mobile, negative on desktop
      const totalOffset = navHeight + leagueNavHeight + teamNavHeight + padding;

      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - totalOffset,
        behavior: 'smooth',
      });
    }
  };

  /**
   * Scrolls back to the top of the page
   */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      <Nav />

      {/* League Banner Section
       * Displays league logo, name, and title
       * Uses league-specific banner color for branding
       */}
      <div className={`w-full ${league.bannerColor} py-8`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Image
              src={league.logo}
              alt={`${league.name} Logo`}
              width={80}
              height={80}
              className="object-contain"
            />
            <h1 className="text-4xl font-bold text-white">{league.name} Teams</h1>
          </div>
        </div>
      </div>

      <LeagueNav leagueId={league.id} />

      {/* Team Navigation Bar
       * Sticky navigation showing team abbreviations
       * Allows quick jumping to specific teams
       * Features glass-morphism design with blur effect
       */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {sortedTeams.map((team) => (
              <button
                key={team.team.id}
                onClick={() => scrollToTeam(team.team.id)}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-secondary hover:bg-secondary/80 hover:opacity-75 transition-all"
              >
                {team.team.teamIdentifier}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Teams Grid Section
       * Main content area displaying team cards
       * Features:
       * - Responsive grid layout (1 column mobile, 2 columns tablet, 3 columns desktop)
       * - Team cards with roster information
       * - Contract values and performance statistics
       */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedTeams.map((teamSeason) => (
            <Card
              key={teamSeason.team.id}
              id={teamSeason.team.id}
              className="card-gradient card-hover overflow-hidden"
            >
              {/* Team Header Section
               * Displays:
               * - Team name with link
               * - Total salary calculation
               * - Win-loss-OT record
               */}
              <CardHeader className="border-b border-border">
                <CardTitle className="flex flex-col">
                  <Link
                    href={`/leagues/${league.id}/teams/${teamSeason.team.teamIdentifier}`}
                    className="text-2xl hover:opacity-75"
                  >
                    {teamSeason.team.officialName}
                  </Link>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-400">
                      $
                      {teamSeason.players
                        .reduce(
                          (total: number, player) => {
                            return total + player.playerSeason.contract.amount;
                          },
                          0
                        )
                        .toLocaleString()}
                    </span>
                    <span className="text-lg font-mono bg-secondary/50 px-3 py-1 rounded-md">
                      {teamSeason.wins}-{teamSeason.losses}-{teamSeason.otLosses}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Team Management */}
                <div className="border-b border-border">
                  <div className="p-4 bg-secondary/30">
                    <h3 className="text-xl font-bold">Management</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {['OWNER', 'GM', 'AGM', 'PAGM'].map((roleStr) => {
                        const role = roleStr as TeamManagementRole;
                        const manager = teamSeason.team.managers.find(m => m.role === role);
                        const isHigherRole = ['OWNER', 'GM', 'AGM'].includes(roleStr);
                        
                        return (
                          <div 
                            key={role}
                            className={`p-3 rounded-lg ${isHigherRole ? 'bg-gray-800/50' : 'bg-gray-700/30'} border border-white/10`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-400">{role}</span>
                            </div>
                            {manager ? (
                              <Link 
                                href={`/users/${manager.user.id}`}
                                className="text-sm hover:text-blue-400"
                              >
                                {manager.user.name || 
                                 manager.user.username || 
                                 manager.user.player?.gamertags[0]?.gamertag || 
                                 manager.user.email}
                              </Link>
                            ) : (
                              <span className="text-sm text-gray-500">Vacant</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Forwards Section
                 * Displays forward roster with position-specific organization
                 * Features:
                 * - Separate sections for LW, C, RW
                 * - Player count with color-coded status
                 * - Contract values and plus/minus statistics
                 * - Links to player profiles
                 */}
                <div className="border-b border-border">
                  <div className="p-4 bg-secondary/30">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Forwards</h3>
                      {(() => {
                        const forwardCount = getPositionPlayers(teamSeason.players, [
                          'LW',
                          'C',
                          'RW',
                        ]).length;
                        let countColor = 'text-red-500';
                        if (forwardCount >= 9) countColor = 'text-green-500';
                        else if (forwardCount >= 6) countColor = 'text-yellow-500';
                        return (
                          <span className={`${countColor} font-medium`}>
                            {forwardCount} players
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Left Wings */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Left Wing</h4>
                        {(() => {
                          const lwCount = getPositionPlayers(teamSeason.players, ['LW']).length;
                          let countColor = 'text-red-500';
                          if (lwCount >= 3) countColor = 'text-green-500';
                          else if (lwCount === 2) countColor = 'text-yellow-500';
                          return (
                            <span className={`${countColor} text-sm font-medium`}>{lwCount}</span>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ['LW']).map((player) => {
                          return (
                            <div
                              key={player.playerSeason.player.id}
                              className="mb-2 flex justify-between items-center last:mb-0"
                            >
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/users/${player.playerSeason.player.id}`}
                                  className="hover:text-blue-400"
                                >
                                  {player.playerSeason.player.gamertags[0]?.gamertag ||
                                    player.playerSeason.player.name}
                                </Link>
                                <span className="text-xs text-gray-400">
                                  ${player.playerSeason.contract.amount.toLocaleString()}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                              >
                                {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Centers */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Center</h4>
                        {(() => {
                          const cCount = getPositionPlayers(teamSeason.players, ['C']).length;
                          let countColor = 'text-red-500';
                          if (cCount >= 3) countColor = 'text-green-500';
                          else if (cCount === 2) countColor = 'text-yellow-500';
                          return (
                            <span className={`${countColor} text-sm font-medium`}>{cCount}</span>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ['C']).map((player) => {
                          return (
                            <div
                              key={player.playerSeason.player.id}
                              className="mb-2 flex justify-between items-center last:mb-0"
                            >
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/users/${player.playerSeason.player.id}`}
                                  className="hover:text-blue-400"
                                >
                                  {player.playerSeason.player.gamertags[0]?.gamertag ||
                                    player.playerSeason.player.name}
                                </Link>
                                <span className="text-xs text-gray-400">
                                  ${player.playerSeason.contract.amount.toLocaleString()}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                              >
                                {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Right Wings */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Right Wing</h4>
                        {(() => {
                          const rwCount = getPositionPlayers(teamSeason.players, ['RW']).length;
                          let countColor = 'text-red-500';
                          if (rwCount >= 3) countColor = 'text-green-500';
                          else if (rwCount === 2) countColor = 'text-yellow-500';
                          return (
                            <span className={`${countColor} text-sm font-medium`}>{rwCount}</span>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ['RW']).map((player) => {
                          return (
                            <div
                              key={player.playerSeason.player.id}
                              className="mb-2 flex justify-between items-center last:mb-0"
                            >
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/users/${player.playerSeason.player.id}`}
                                  className="hover:text-blue-400"
                                >
                                  {player.playerSeason.player.gamertags[0]?.gamertag ||
                                    player.playerSeason.player.name}
                                </Link>
                                <span className="text-xs text-gray-400">
                                  ${player.playerSeason.contract.amount.toLocaleString()}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                              >
                                {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Defense Section
                 * Displays defensive roster organization
                 * Features:
                 * - Separate sections for LD, RD
                 * - Player count with color-coded status
                 * - Contract values and plus/minus statistics
                 * - Links to player profiles
                 */}
                <div className="border-b border-border">
                  <div className="p-4 bg-secondary/30">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Defense</h3>
                      {(() => {
                        const defenseCount = getPositionPlayers(teamSeason.players, [
                          'LD',
                          'RD',
                        ]).length;
                        let countColor = 'text-red-500';
                        if (defenseCount >= 6) countColor = 'text-green-500';
                        else if (defenseCount >= 4) countColor = 'text-yellow-500';
                        return (
                          <span className={`${countColor} font-medium`}>
                            {defenseCount} players
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Left Defense */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Left Defense</h4>
                        {(() => {
                          const ldCount = getPositionPlayers(teamSeason.players, ['LD']).length;
                          let countColor = 'text-yellow-500';
                          if (ldCount >= 3) countColor = 'text-green-500';
                          return (
                            <span className={`${countColor} text-sm font-medium`}>{ldCount}</span>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ['LD']).map((player) => {
                          return (
                            <div
                              key={player.playerSeason.player.id}
                              className="mb-2 flex justify-between items-center last:mb-0"
                            >
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/users/${player.playerSeason.player.id}`}
                                  className="hover:text-blue-400"
                                >
                                  {player.playerSeason.player.gamertags[0]?.gamertag ||
                                    player.playerSeason.player.name}
                                </Link>
                                <span className="text-xs text-gray-400">
                                  ${player.playerSeason.contract.amount.toLocaleString()}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                              >
                                {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Right Defense */}
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Right Defense</h4>
                        {(() => {
                          const rdCount = getPositionPlayers(teamSeason.players, ['RD']).length;
                          let countColor = 'text-yellow-500';
                          if (rdCount >= 3) countColor = 'text-green-500';
                          return (
                            <span className={`${countColor} text-sm font-medium`}>{rdCount}</span>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ['RD']).map((player) => {
                          return (
                            <div
                              key={player.playerSeason.player.id}
                              className="mb-2 flex justify-between items-center last:mb-0"
                            >
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/users/${player.playerSeason.player.id}`}
                                  className="hover:text-blue-400"
                                >
                                  {player.playerSeason.player.gamertags[0]?.gamertag ||
                                    player.playerSeason.player.name}
                                </Link>
                                <span className="text-xs text-gray-400">
                                  ${player.playerSeason.contract.amount.toLocaleString()}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-sm min-w-[48px] text-center ${player.plusMinus >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                              >
                                {player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Goalies Section
                 * Displays goalie roster and statistics
                 * Features:
                 * - Save percentage calculation and display
                 * - Color-coded performance indicators
                 * - Contract values
                 * - Links to player profiles
                 */}
                <div>
                  <div className="p-4 bg-secondary/30">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">Goalies</h3>
                      {(() => {
                        const goalieCount = getPositionPlayers(teamSeason.players, ['G']).length;
                        let countColor = 'text-red-500';
                        if (goalieCount >= 2) countColor = 'text-green-500';
                        else if (goalieCount === 1) countColor = 'text-yellow-500';
                        return (
                          <span className={`${countColor} font-medium`}>{goalieCount} players</span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-3 flex flex-col shadow-sm">
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-border/50">
                        <h4 className="font-semibold text-primary">Goalies</h4>
                        {(() => {
                          const gCount = getPositionPlayers(teamSeason.players, ['G']).length;
                          let countColor = 'text-yellow-500';
                          if (gCount >= 2) countColor = 'text-green-500';
                          return (
                            <span className={`${countColor} text-sm font-medium`}>{gCount}</span>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        {getPositionPlayers(teamSeason.players, ['G']).map((player) => {
                          const saves = player.saves ?? 0;
                          const goalsAgainst = player.goalsAgainst ?? 0;
                          const totalShots = saves + goalsAgainst;
                          const savePercentage = totalShots > 0 ? saves / totalShots : 0;

                          let savePercentageColor = 'text-red-500 bg-red-500/20';
                          if (savePercentage >= 0.8) {
                            savePercentageColor = 'text-green-500 bg-green-500/20';
                          } else if (savePercentage >= 0.7) {
                            savePercentageColor = 'text-yellow-500 bg-yellow-500/20';
                          }

                          return (
                            <div
                              key={player.playerSeason.player.id}
                              className="mb-2 flex justify-between items-center last:mb-0"
                            >
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/users/${player.playerSeason.player.id}`}
                                  className="hover:text-blue-400"
                                >
                                  {player.playerSeason.player.gamertags[0]?.gamertag ||
                                    player.playerSeason.player.name}
                                </Link>
                                <span className="text-xs text-gray-400">
                                  ${player.playerSeason.contract.amount.toLocaleString()}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-sm ${savePercentageColor}`}
                              >
                                {totalShots === 0
                                  ? '0.0%'
                                  : `${(savePercentage * 100).toFixed(1)}%`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Back to Top Button
       * Appears when scrolled past threshold
       * Provides easy navigation back to top of page
       * Features smooth scroll animation
       */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Back to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
