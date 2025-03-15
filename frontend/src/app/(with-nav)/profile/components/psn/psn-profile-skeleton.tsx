import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PSNProfileHeader } from './psn-profile-header';

export function PSNProfileSkeleton() {
  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      <PSNProfileHeader isLoading={true} />
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <Skeleton className="w-20 h-20 rounded-lg bg-gray-700" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-40 bg-gray-700" />
            <Skeleton className="h-4 w-full bg-gray-700" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24 bg-gray-700" />
              <Skeleton className="h-4 w-32 bg-gray-700" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 p-4 rounded-lg mb-6">
          <Skeleton className="h-6 w-40 bg-gray-700 mb-3" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-16 bg-gray-700 rounded-lg" />
            <Skeleton className="h-16 bg-gray-700 rounded-lg" />
            <Skeleton className="h-16 bg-gray-700 rounded-lg" />
            <Skeleton className="h-16 bg-gray-700 rounded-lg" />
          </div>
        </div>

        <Skeleton className="h-10 w-full bg-gray-700 rounded-lg mb-4" />

        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-16 h-16 bg-gray-700 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-5 w-48 bg-gray-700 mb-2" />
                <Skeleton className="h-3 w-full bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
