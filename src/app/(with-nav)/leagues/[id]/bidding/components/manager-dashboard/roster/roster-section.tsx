import { getPositionCount, getPositionPlayers } from '../../../utils/roster-utils';
import { PositionGroup } from './position-group';
import {
  PlayerPositionGroup,
  ActivePlayerInfo
} from '../../../types';

// interface Player {
//   id: string;
//   name: string;
//   position: string;
//   gamertag: string;
//   contractAmount: number;
// }

// interface ActivePlayerInfo {
//   id: string;
//   gamertag: string;
//   currentTeamId: string | null;
// }

interface RosterSectionProps {
  roster: PlayerPositionGroup[];
  managedTeamId: string;
  activePlayers: ActivePlayerInfo[];
}

export function RosterSection({
  roster,
  managedTeamId,
  activePlayers,
}: RosterSectionProps) {
  return (
    <div className="mt-8 card-gradient rounded-lg overflow-hidden">
      <div className="bg-gray-900/80 p-4 border-b border-gray-800">
        <h3 className="text-lg font-semibold">Current Roster</h3>
      </div>

      <div className="p-4">
        {/* Forwards Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-800">
            <h4 className="font-semibold">Forwards</h4>
            <span
              className={`text-sm font-medium ${getPositionCount(roster, ['LW', 'C', 'RW']) >= 9 ? 'text-green-500' : getPositionCount(roster, ['LW', 'C', 'RW']) >= 6 ? 'text-yellow-500' : 'text-red-500'}`}
            >
              {getPositionCount(roster, ['LW', 'C', 'RW'])} players
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Left Wing */}
            <PositionGroup
              position="LW"
              title="Left Wing"
              titleColor="text-blue-300"
              players={getPositionPlayers(roster, 'LW')}
              managedTeamId={managedTeamId}
              activePlayers={activePlayers}
            />

            {/* Center */}
            <PositionGroup
              position="C"
              title="Center"
              titleColor="text-red-300"
              players={getPositionPlayers(roster, 'C')}
              managedTeamId={managedTeamId}
              activePlayers={activePlayers}
            />

            {/* Right Wing */}
            <PositionGroup
              position="RW"
              title="Right Wing"
              titleColor="text-green-300"
              players={getPositionPlayers(roster, 'RW')}
              managedTeamId={managedTeamId}
              activePlayers={activePlayers}
            />
          </div>
        </div>

        {/* Defense Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-800">
            <h4 className="font-semibold">Defense</h4>
            <span
              className={`text-sm font-medium ${getPositionCount(roster, ['LD', 'RD']) >= 6 ? 'text-green-500' : getPositionCount(roster, ['LD', 'RD']) >= 4 ? 'text-yellow-500' : 'text-red-500'}`}
            >
              {getPositionCount(roster, ['LD', 'RD'])} players
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Left Defense */}
            <PositionGroup
              position="LD"
              title="Left Defense"
              titleColor="text-teal-300"
              players={getPositionPlayers(roster, 'LD')}
              managedTeamId={managedTeamId}
              activePlayers={activePlayers}
            />

            {/* Right Defense */}
            <PositionGroup
              position="RD"
              title="Right Defense"
              titleColor="text-yellow-300"
              players={getPositionPlayers(roster, 'RD')}
              managedTeamId={managedTeamId}
              activePlayers={activePlayers}
            />
          </div>
        </div>

        {/* Goalies Section */}
        <div>
          <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-800">
            <h4 className="font-semibold">Goalies</h4>
            <span
              className={`text-sm font-medium ${getPositionCount(roster, ['G']) >= 2 ? 'text-green-500' : getPositionCount(roster, ['G']) === 1 ? 'text-yellow-500' : 'text-red-500'}`}
            >
              {getPositionCount(roster, ['G'])} players
            </span>
          </div>

          <div>
            <PositionGroup
              position="G"
              title="Goalies"
              titleColor="text-purple-300"
              players={getPositionPlayers(roster, 'G')}
              managedTeamId={managedTeamId}
              activePlayers={activePlayers}
            />
          </div>
        </div>
      </div>
    </div>
  );
}