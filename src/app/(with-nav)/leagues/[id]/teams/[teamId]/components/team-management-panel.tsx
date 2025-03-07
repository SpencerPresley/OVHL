import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamManagementRole } from '@prisma/client';

interface Manager {
  role: TeamManagementRole;
  user: {
    id: string;
    name: string | null;
    email: string;
    username: string | null;
    player: {
      id: string;
      gamertags: {
        gamertag: string;
      }[];
    } | null;
  };
}

interface TeamManagementPanelProps {
  managers: Manager[];
}

export function TeamManagementPanel({ managers }: TeamManagementPanelProps) {
  return (
    <Card className="mb-8 card-gradient card-hover">
      <CardHeader>
        <CardTitle>Team Management</CardTitle>
        <CardDescription>Current team management staff</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {['OWNER', 'GM', 'AGM', 'PAGM'].map((role) => {
            const manager = managers.find((m) => m.role === role);
            const isHigherRole = ['OWNER', 'GM', 'AGM'].includes(role);

            return (
              <div
                key={role}
                className={`p-4 rounded-lg ${isHigherRole ? 'bg-gray-800/50' : 'bg-gray-700/30'} border border-white/10`}
              >
                <h3 className="font-semibold mb-2">{role}</h3>
                {manager ? (
                  <Link href={`/users/${manager.user.id}`} className="text-sm hover:text-blue-400">
                    {manager.user.name ||
                      manager.user.username ||
                      manager.user.player?.gamertags[0]?.gamertag ||
                      manager.user.email}
                  </Link>
                ) : (
                  <span className="text-sm text-gray-400">Vacant</span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
