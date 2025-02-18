import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User as UserIcon } from 'lucide-react';

interface ProfileFormProps {
  formData: {
    name: string;
    username: string;
  };
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (field: string, value: string) => void;
}

export function ProfileForm({ formData, onSubmit, onChange }: ProfileFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-200">
            Display Name
          </Label>
          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-gray-400" />
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Your name"
              className="bg-gray-800/50 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-200">
            Username
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">@</span>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => onChange('username', e.target.value)}
              placeholder="username"
              className="bg-gray-800/50 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
