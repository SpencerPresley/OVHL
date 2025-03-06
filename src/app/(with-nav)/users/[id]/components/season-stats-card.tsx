import { 
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { TeamSeasonStats } from './team-season-stats';
import { StatBlock } from './stat-block';
import type { PlayerSeason } from '@/lib/services/user-service';

interface SeasonStatsCardProps {
    season: PlayerSeason;
}

export function SeasonStatsCard({ season }: SeasonStatsCardProps) {
    return (
        <Card className="mb-4 card-gradient card-hover">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Season Stats</span>
            <span className="text-sm bg-gray-700 px-3 py-1 rounded-lg text-white">
              {season.position}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Total Season Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Total Season Stats</h3>
            <div className="grid grid-cols-5 gap-4">
                <StatBlock label="Games" value={season.gamesPlayed || 0} />
                <StatBlock label="Goals" value={season.goals || 0} />
                <StatBlock label="Assists" value={season.assists || 0} />
                <StatBlock label="Points" value={(season.goals || 0) + (season.assists || 0)} />
                <StatBlock label="+/-" value={season.plusMinus || 0} />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
                <StatBlock label="Shots" value={season.shots || 0} />
                <StatBlock label="Hits" value={season.hits || 0} />
                <StatBlock label="Takeaways" value={season.takeaways || 0} />
                <StatBlock label="PIM" value={season.penaltyMinutes || 0} />
            </div>
          </div>

          {/* Per-Team Stats */}
          {season.teamSeasons.map((teamSeason, idx) => (
            <TeamSeasonStats key={idx} teamSeason={teamSeason} />
          ))}
        </CardContent>
      </Card>
    )
}