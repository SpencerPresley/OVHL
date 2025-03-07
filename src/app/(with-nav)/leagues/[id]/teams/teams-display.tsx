'use client';

import React, { useState, useEffect } from 'react';
import { LeagueNav } from '@/components/league-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToTop } from '@/components/back-to-top';
import { NHL_TEAMS } from '@/lib/teams/nhl';
import { AHL_TEAMS } from '@/lib/teams/ahl';
import { ECHL_TEAMS } from '@/lib/teams/echl';
import { CHL_TEAMS } from '@/lib/teams/chl';
import type { NHLTeam, AHLTeam, ECHLTeam, CHLTeam } from '@/lib/teams/types';

// Utilities
import { calculateTeamSalary } from './utils/salary-utils';

// Types
import { League } from './types/league';
import { TeamSeason } from './types/team-season';

// Page Components
import { LeagueBannerTeams } from './components/league-banner-teams';
import { TeamQuickNav } from './components/team-quick-nav';
import { TeamsCardTitleContent } from './components/teams-card-title-content';
import { TeamsCardContent } from './components/teams-card-content';

/**
 * Props for the TeamsDisplay component
 */
interface TeamsDisplayProps {
  league: League;
  teams: TeamSeason[];
}

type LeagueTeam = NHLTeam | AHLTeam | ECHLTeam | CHLTeam;

export function TeamsDisplay({ league, teams }: TeamsDisplayProps) {
  const USE_DEBUG = false;
  
  // Sort teams alphabetically by name and filter by league-specific teams
  const sortedTeams = [...teams].sort((a, b) =>
    a.team.officialName.localeCompare(b.team.officialName)
  );

  // Add debug logging at the start of the component
  useEffect(() => {
    if (USE_DEBUG) {
      teams.forEach((teamSeason) => {
        teamSeason.players.forEach((player) => {
          console.log('Player Contract Debug:', {
            name: player.playerSeason.player.name,
            contractAmount: player.playerSeason.contract.amount,
          });
        });
      });
    }
  }, [teams]);


  return (
    <div className="min-h-screen">
      <LeagueBannerTeams league={league} />

      <LeagueNav leagueId={league.id} />

      <TeamQuickNav sortedTeams={sortedTeams} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedTeams.map((teamSeason) => {
            const { totalSalary, salaryCap, salaryColor } = calculateTeamSalary(teamSeason);

            // Debug log for team salary data
            if (USE_DEBUG) {
              console.log('Team Salary Data:', {
                teamName: teamSeason.team.officialName,
                totalSalary,
                salaryCap,
                tier: teamSeason.tier,
              });
            }

            return (
              <Card
                key={teamSeason.team.id}
                id={teamSeason.team.id}
                className="card-gradient card-hover overflow-hidden"
              >
                <CardHeader className="border-b border-border">
                  <CardTitle className="flex flex-col">
                    <TeamsCardTitleContent
                      teamSeason={teamSeason}
                      league={league}
                      totalSalary={totalSalary}
                      salaryCap={salaryCap}
                      salaryColor={salaryColor}
                    />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <TeamsCardContent teamSeason={teamSeason} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <BackToTop />
    </div>
  );
}
