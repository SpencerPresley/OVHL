'use client';

import Image from 'next/image';
import { TeamSeason } from '../types/team-season';
import { scrollToTeam } from '../utils/scroll-to-team';

interface TeamQuickNavProps {
  sortedTeams: TeamSeason[];
}

export function TeamQuickNav({ sortedTeams }: TeamQuickNavProps) {
  return (
    <div className="lg:sticky top-0 z-10 bg-background/100 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-wrap justify-center gap-2">
          {sortedTeams.map((team) => (
            <button
              key={team.team.id}
              onClick={() => scrollToTeam(team.team.id)}
              title={team.team.fullTeamName}
              className="p-1 rounded-md bg-secondary/60 hover:bg-secondary/90 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <div className="relative w-16 h-16">
                {team.team.logoPath ? (
                  <Image
                    src={team.team.logoPath}
                    alt={`${team.team.fullTeamName} logo`}
                    layout="fill"
                    objectFit="contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-600 rounded-sm flex items-center justify-center text-xs font-bold text-gray-300">
                    {team.team.teamAbbreviation}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
