import { LeagueNav } from '@/components/league-nav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToTop } from '@/components/back-to-top';
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

  // Sort teams alphabetically by name using fullTeamName
  const sortedTeams = [...teams].sort((a, b) =>
    a.team.fullTeamName.localeCompare(b.team.fullTeamName)
  );

  if (USE_DEBUG) {
    teams.forEach((teamSeason) => {
      console.log('Team Season Debug:', {
        teamName: teamSeason.team.fullTeamName, // Use fullTeamName
        players: teamSeason.players.length,
        salaryCap: teamSeason.salaryCap, // Log the cap
        managers: teamSeason.managers, // Log managers
      });
    });
  }

  return (
    <div className="min-h-screen">
      <LeagueBannerTeams league={league} />

      <LeagueNav leagueId={league.id} />

      <TeamQuickNav sortedTeams={sortedTeams} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {sortedTeams.map((teamSeason) => {
            // calculateTeamSalary now gets cap from teamSeason
            const { totalSalary, salaryCap, salaryColor } = calculateTeamSalary(teamSeason);

            // Extract colors for gradient
            const primaryColor = teamSeason.team.primaryColor || '#4b5563'; // Fallback gray-600
            const secondaryColor = teamSeason.team.secondaryColor || '#374151'; // Fallback gray-700

            const headerStyle = {
              background: `linear-gradient(to right, ${primaryColor}30, ${secondaryColor}40)`, // Adjusted opacity
              borderLeft: `4px solid ${primaryColor}`,
              borderBottom: '1px solid var(--border)', // Re-apply border-bottom using CSS variable or explicit color
            };

            // Debug log for team salary data
            if (USE_DEBUG) {
              console.log('Team Salary Data:', {
                teamName: teamSeason.team.fullTeamName, // Use fullTeamName
                totalSalary,
                salaryCap,
                colors: { primaryColor, secondaryColor }
              });
            }

            return (
              <Card
                key={teamSeason.team.id}
                id={teamSeason.team.id}
                className="card-gradient card-hover overflow-hidden"
              >
                <CardHeader style={headerStyle} className="p-4">
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
