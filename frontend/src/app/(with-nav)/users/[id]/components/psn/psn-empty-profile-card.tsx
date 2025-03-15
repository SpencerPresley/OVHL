import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';

export function EmptyProfileCard() {
  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          PlayStation Network
        </CardTitle>
        <CardDescription className="text-gray-300">
          This user has not connected their PSN account.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
