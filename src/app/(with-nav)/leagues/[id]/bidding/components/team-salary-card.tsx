'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TeamSalaryCardProps {
  team: {
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
  leagueId: string;
}

export function TeamSalaryCard({ team, leagueId }: TeamSalaryCardProps) {
  return (
    <div className="group">
      <div className="p-4 rounded-lg bg-black/60 backdrop-blur-sm transition-all duration-200 group-hover:bg-black/40 group-hover:scale-[1.02]">
        <Link
          href={`/leagues/${leagueId}/teams/${team.identifier}`}
          className="hover:text-blue-400"
        >
          <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
        </Link>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Salary Cap:</span>
            <span className="font-mono">${team.salary.cap.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Current Salary:</span>
            <span
              className={cn('font-mono', {
                'text-red-500': team.salary.current > team.salary.cap,
                'text-green-500': team.salary.current === team.salary.cap,
                'text-white': team.salary.current < team.salary.cap,
              })}
            >
              ${team.salary.current.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Space:</span>
            <span className="font-mono">
              ${(team.salary.cap - team.salary.current).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-xs text-muted-foreground">Forwards</div>
              <div
                className={cn('font-medium', {
                  'text-green-500': team.roster.forwards >= 9,
                  'text-yellow-500': team.roster.forwards >= 6,
                  'text-red-500': team.roster.forwards < 6,
                })}
              >
                {team.roster.forwards}/9
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-xs text-muted-foreground">Defense</div>
              <div
                className={cn('font-medium', {
                  'text-green-500': team.roster.defense >= 6,
                  'text-yellow-500': team.roster.defense >= 4,
                  'text-red-500': team.roster.defense < 4,
                })}
              >
                {team.roster.defense}/6
              </div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-xs text-muted-foreground">Goalies</div>
              <div
                className={cn('font-medium', {
                  'text-green-500': team.roster.goalies >= 2,
                  'text-yellow-500': team.roster.goalies >= 1,
                  'text-red-500': team.roster.goalies < 1,
                })}
              >
                {team.roster.goalies}/2
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
