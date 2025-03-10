import { Suspense } from 'react';
import { Filters } from '../filters';
import { PlayerList } from '../player-list';
import { PlayerListSkeleton } from '../skeletons/player-list-skeleton';
import { Player, TeamData } from '../../types';

// interface Bid {
//   teamId: string;
//   teamName: string;
//   amount: number;
//   timestamp: number;
// }

// interface Player {
//   id: string;
//   name: string;
//   position: string;
//   gamertag: string;
//   currentBid: number | null;
//   currentTeamId: string | null;
//   currentTeamName: string | null;
//   bids: Bid[];
//   endTime?: number;
//   contract: {
//     amount: number;
//   };
//   stats: {
//     gamesPlayed: number;
//     goals: number;
//     assists: number;
//     plusMinus: number;
//   };
//   player: {
//     user: {
//       id: string;
//     };
//   };
// }

// interface TeamData {
//   salaryCap: number;
//   currentSalary: number;
//   totalCommitted: number;
//   activeBids: {
//     playerSeasonId: string;
//     playerName?: string;
//     position?: string;
//     amount: number;
//     endTime?: number;
//   }[];
//   roster?: {
//     id: string;
//     name: string;
//     position: string;
//     gamertag: string;
//     contractAmount: number;
//   }[];
// }

interface PlayersTabProps {
  players: Player[];
  filteredPlayers: Player[];
  isDetailedView: boolean;
  positionFilter: string[];
  bidStatusFilter: string;
  priceSort: 'asc' | 'desc' | null;
  searchQuery: string;
  isFiltersOpen: boolean;
  canBid: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  managedTeamId: string | null;
  teamData: TeamData | null;
  onPlaceBid: (playerId: string, amount: number) => void;
  setPositionFilter: (value: string[]) => void;
  setBidStatusFilter: (value: string) => void;
  setPriceSort: (value: 'asc' | 'desc' | null) => void;
  setSearchQuery: (value: string) => void;
  setIsDetailedView: (value: boolean) => void;
  setIsFiltersOpen: (value: boolean) => void;
}

export function PlayersTab({
  players,
  filteredPlayers,
  isDetailedView,
  positionFilter,
  bidStatusFilter,
  priceSort,
  searchQuery,
  isFiltersOpen,
  canBid,
  isSubmitting,
  isLoading,
  managedTeamId,
  teamData,
  onPlaceBid,
  setPositionFilter,
  setBidStatusFilter,
  setPriceSort,
  setSearchQuery,
  setIsDetailedView,
  setIsFiltersOpen,
}: PlayersTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Filters
          setPositionFilter={setPositionFilter}
          setBidStatusFilter={setBidStatusFilter}
          setPriceSort={setPriceSort}
          setSearchQuery={setSearchQuery}
          setIsDetailedView={setIsDetailedView}
          positionFilter={positionFilter}
          bidStatusFilter={bidStatusFilter}
          priceSort={priceSort}
          searchQuery={searchQuery}
          isDetailedView={isDetailedView}
          isFiltersOpen={isFiltersOpen}
          setIsFiltersOpen={setIsFiltersOpen}
          totalPlayers={players.length}
          filteredCount={filteredPlayers.length}
        />

        <Suspense fallback={<PlayerListSkeleton />}>
          {isLoading ? (
            <PlayerListSkeleton />
          ) : (
            <PlayerList
              players={filteredPlayers}
              isDetailedView={isDetailedView}
              onPlaceBid={onPlaceBid}
              canBid={canBid}
              isSubmitting={isSubmitting}
              managedTeamId={managedTeamId}
              teamData={teamData}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
