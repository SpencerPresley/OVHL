import { TeamManagementRole } from '@prisma/client';
import { TeamManager } from '../../types';

interface TeamManagementSectionProps {
  managers: TeamManager[];
}

export function TeamManagementSection({ managers }: TeamManagementSectionProps) {
  return (
    <div className="mb-6 border-b border-gray-700 pb-6">
      <h3 className="text-lg font-medium mb-3">Team Management</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {['OWNER', 'GM', 'AGM', 'PAGM'].map((roleStr) => {
          const role = roleStr as TeamManagementRole;
          const manager = managers.find((m) => m.role === role);
          const isHigherRole = ['OWNER', 'GM', 'AGM'].includes(roleStr);

          return (
            <div
              key={roleStr}
              className={`bg-gray-800/40 rounded-lg p-3 border ${isHigherRole ? 'border-gray-600/50' : 'border-gray-700/30'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-400">{roleStr}</span>
              </div>
              {manager ? (
                <span className="font-medium text-sm">{manager.name}</span>
              ) : (
                <span className="text-sm text-gray-500">Vacant</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
