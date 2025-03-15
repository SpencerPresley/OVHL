import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2 } from 'lucide-react';

interface PSNProfileHeaderProps {
  isLoading?: boolean;
}

export function PSNProfileHeader({ isLoading = false }: PSNProfileHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Gamepad2 className="h-5 w-5" />
        PlayStation Network Profile
      </CardTitle>
      <CardDescription className="text-gray-300">
        {isLoading ? 'Loading your PSN profile...' : 'View your PSN profile, games, and trophies'}
      </CardDescription>
    </CardHeader>
  );
}
