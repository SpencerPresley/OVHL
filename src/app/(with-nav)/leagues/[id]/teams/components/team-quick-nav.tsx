'use client';

import { TeamSeason } from '../types/team-season';
import { scrollToTeam } from '../utils/scroll-to-team';

interface TeamQuickNavProps {
    sortedTeams: TeamSeason[];
}

export function TeamQuickNav({ sortedTeams }: TeamQuickNavProps) {
    return (
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
    );
}