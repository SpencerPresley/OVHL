'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

type TeamSalaryCardProps = {
  // Either the original team and leagueId structure
  team?: {
    id: string;
    name: string;
    identifier: string;
    salary: {
      current: number;
      cap: number;
    };
    roster: {
      forwards: number;
      defense: number;
      goalies: number;
    };
  };
  leagueId?: string;
} | {
  // Or the simpler structure for a team manager view
  teamName: string;
  salaryCap: number;
  currentSpent: number;
  committed: number;
  availableCap: number;
};

export function TeamSalaryCard(props: TeamSalaryCardProps) {
  // Determine which prop structure we're using
  const isLegacyProps = 'team' in props;
  
  // For legacy props
  if (isLegacyProps && props.team && props.leagueId) {
    const { team, leagueId } = props;
    
    return (
      <div className="group">
        <div className="p-4 rounded-lg bg-black/60 backdrop-blur-sm transition-all duration-200 group-hover:bg-black/40 group-hover:scale-[1.02]">
          <Link
            href={`/leagues/${leagueId}/teams/${team.identifier}`}
            className="hover:text-blue-400"
          >
            <h3 className="text-lg font-semibold mb-2">{team.name}</h3>
          </Link>
          
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Salary Cap:</span>
              <span className="font-mono">${team.salary.cap.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Current Salary:</span>
              <span className="font-mono">${team.salary.current.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cap Space:</span>
              <span className={cn('font-mono', (team.salary.cap - team.salary.current) > 0 ? 'text-green-400' : 'text-red-400')}>
                ${(team.salary.cap - team.salary.current).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-3">
            <div
              className={cn('h-full', {
                'bg-green-500': team.salary.current / team.salary.cap < 0.8,
                'bg-yellow-500': team.salary.current / team.salary.cap >= 0.8 && team.salary.current / team.salary.cap < 1,
                'bg-red-500': team.salary.current / team.salary.cap >= 1,
              })}
              style={{ width: `${Math.min(100, (team.salary.current / team.salary.cap) * 100)}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-gray-400 block">Forwards</span>
              <span>{team.roster.forwards}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Defense</span>
              <span>{team.roster.defense}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Goalies</span>
              <span>{team.roster.goalies}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // For the new simplified props
  const { teamName, salaryCap, currentSpent, committed, availableCap } = props as {
    teamName: string;
    salaryCap: number;
    currentSpent: number;
    committed: number;
    availableCap: number;
  };
  
  return (
    <div className="card-gradient rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{teamName} Salary Cap</h2>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Salary Cap:</span>
            <span className="font-mono text-lg">${salaryCap.toLocaleString()}</span>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                <span>Current Roster:</span>
              </span>
              <span className="font-mono">${currentSpent.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                <span>Active Bids:</span>
              </span>
              <span className="font-mono">${committed.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                <span>Available Cap:</span>
              </span>
              <span className={cn('font-mono', availableCap > 0 ? 'text-blue-400' : 'text-red-400')}>
                ${availableCap.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden mt-4">
            <div className="flex h-full">
              <div 
                className="bg-green-500 h-full" 
                style={{ width: `${Math.min(100, (currentSpent / salaryCap) * 100)}%` }}
              ></div>
              <div 
                className="bg-yellow-500 h-full" 
                style={{ width: `${Math.min(100 - (currentSpent / salaryCap) * 100, (committed / salaryCap) * 100)}%` }}
              ></div>
              <div 
                className="bg-blue-500 h-full" 
                style={{ width: `${Math.max(0, (availableCap / salaryCap) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
