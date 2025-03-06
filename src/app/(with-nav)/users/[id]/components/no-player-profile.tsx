import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function NoPlayerProfile() {
    return (
        <div>
          <div className="container mx-auto py-8">
            <Card>
              <CardHeader>
                <CardTitle>User Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold">User</h2>
                    <p className="text-gray-500">No player data available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
}