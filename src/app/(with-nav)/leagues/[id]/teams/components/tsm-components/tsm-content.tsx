import Link from 'next/link'
import { TeamManagementRole } from '@prisma/client';
import { Manager } from '../../types/manager';

interface TSMContentProps {
    managers: Manager[];
}

export function TSMContent({ managers }: TSMContentProps) {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {['OWNER', 'GM', 'AGM', 'PAGM'].map((roleStr) => {
          const role = roleStr as TeamManagementRole;
          const manager = managers.find((m) => m.role === role);
          const isHigherRole = ['OWNER', 'GM', 'AGM'].includes(roleStr);

          return (
            <div
              key={role}
              className={`p-3 rounded-lg ${isHigherRole ? 'bg-gray-800/50' : 'bg-gray-700/30'} border border-white/10`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-400">{role}</span>
              </div>
              {manager ? (
                <Link href={`/users/${manager.user.id}`} className="text-sm hover:text-blue-400">
                  {manager.user.name ||
                    manager.user.username ||
                    manager.user.player?.gamertags[0]?.gamertag ||
                    manager.user.email}
                </Link>
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
