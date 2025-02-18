import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, Shield } from 'lucide-react';

interface AccountFormProps {
  email: string;
  isAdmin: boolean;
  onEmailChange: (email: string) => void;
  onResetPassword: () => void;
  onDeleteAccount: () => void;
}

export function AccountForm({ 
  email, 
  isAdmin, 
  onEmailChange, 
  onResetPassword, 
  onDeleteAccount 
}: AccountFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-200">Email Address</Label>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <Input
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              type="email"
              placeholder="Email"
              className="bg-gray-800/50 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {isAdmin && (
        <div className="flex items-center gap-4 rounded-lg bg-gray-800/50 border border-white/10 p-4">
          <Shield className="h-5 w-5 text-blue-400" />
          <div>
            <h4 className="font-medium text-white">Administrator Account</h4>
            <p className="text-sm text-gray-300">
              This account has administrative privileges
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          className="border-white/10 text-white hover:bg-gray-800/50"
          onClick={onResetPassword}
        >
          Reset Password
        </Button>
        <Button 
          variant="destructive" 
          className="bg-red-600 hover:bg-red-700"
          onClick={onDeleteAccount}
        >
          Delete Account
        </Button>
      </div>
    </div>
  );
} 