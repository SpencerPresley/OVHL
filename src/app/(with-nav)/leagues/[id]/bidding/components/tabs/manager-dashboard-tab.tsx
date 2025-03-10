import { TeamSalaryCard } from '../team-salary-card';
import { TeamManagementSection } from '../manager-dashboard/team-management-section';
import { ActiveBidsSection } from '../manager-dashboard/active-bids-section';
import { RosterSection } from '../manager-dashboard/roster/roster-section';
import { 
  Team,
  TeamData,
  AvailablePlayer
} from '../../types';

// interface Team {
//   id: string;
//   name: string;
//   identifier: string;
//   managers: any[];
//   stats: {
//     wins: number;
//     losses: number;
//     otLosses: number;
//   };
//   roster: {
//     forwards: number;
//     defense: number;
//     goalies: number;
//   };
//   salary: {
//     current: number;
//     cap: number;
//   };
// }

// interface TeamData {
//   activeBids: {
//     playerSeasonId: string;
//     playerName: string;
//     position: string;
//     amount: number;
//     endTime: number;
//   }[];
//   totalCommitted: number;
//   roster: {
//     id: string;
//     name: string;
//     position: string;
//     gamertag: string;
//     contractAmount: number;
//   }[];
//   salaryCap: number;
//   currentSalary: number;
// }

// interface AvailablePlayer {
//   id: string;
//   gamertag: string;
//   currentTeamId: string | null;
// }

interface ManagerDashboardTabProps {
  team: Team;
  teamData: TeamData | null;
  availablePlayers: AvailablePlayer[];
}

export function ManagerDashboardTab({ team, teamData, availablePlayers }: ManagerDashboardTabProps) {
  if (!teamData) return null;
  
  return (
    <div className="space-y-6">
      <div className="card-gradient rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{team.name} Dashboard</h2>

        {/* Team Management Section */}
        <TeamManagementSection managers={team.managers} />

        {/* Team Salary Overview */}
        <TeamSalaryCard
          teamName={team.name}
          salaryCap={teamData.salaryCap || 0}
          currentSpent={teamData.currentSalary || 0}
          committed={teamData.totalCommitted || 0}
          availableCap={
            (teamData.salaryCap || 0) -
            (teamData.currentSalary || 0) -
            (teamData.totalCommitted || 0)
          }
        />

        {/* Active Bids Section */}
        <ActiveBidsSection activeBids={teamData.activeBids} />

        {/* Current Roster Section */}
        {teamData.roster && teamData.roster.length > 0 && (
          <RosterSection 
            roster={teamData.roster} 
            managedTeamId={team.id}
            activePlayers={availablePlayers}
          />
        )}
      </div>
    </div>
  );
}