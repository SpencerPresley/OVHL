import Link from 'next/link';
import { StatBlock } from './stat-block';

interface TeamSeasonStatsProps {
    teamSeason: {
        teamSeason: {
            team: {
                id: string;
                officialName: string;
                teamIdentifier: string;
            };
            tier: {
                name: string;
            };
        };
        gamesPlayed: number | null;
        goals: number | null;
        assists: number | null;
        plusMinus: number | null;
        shots: number | null;
        hits: number | null;
        takeaways: number | null;
        giveaways: number | null;
        penaltyMinutes: number | null;
    };
}

export function TeamSeasonStats({ teamSeason }: TeamSeasonStatsProps) {
    return (
        <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            <Link
              href={`/leagues/${teamSeason.teamSeason.tier.name.toLowerCase()}/teams/${teamSeason.teamSeason.team.teamIdentifier}`}
              className="hover:opacity-75"
            >
              {teamSeason.teamSeason.team.officialName}
            </Link>
          </h3>
        </div>
        <div className="grid grid-cols-5 gap-4">
            <StatBlock label="Games" value={teamSeason.gamesPlayed || 0} />
            <StatBlock label="Goals" value={teamSeason.goals || 0} />
            <StatBlock label="Assists" value={teamSeason.assists || 0} />
            <StatBlock label="Points" value={(teamSeason.goals || 0) + (teamSeason.assists || 0)} />
            <StatBlock label="+/-" value={teamSeason.plusMinus || 0} />
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
            <StatBlock label="Shots" value={teamSeason.shots || 0} />
            <StatBlock label="Hits" value={teamSeason.hits || 0} />
            <StatBlock label="Takeaways" value={teamSeason.takeaways || 0} />
            <StatBlock label="PIM" value={teamSeason.penaltyMinutes || 0} />
        </div>
      </div>
    )
}