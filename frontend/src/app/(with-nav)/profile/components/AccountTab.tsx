'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountForm } from '../account-form';

interface AccountTabProps {
  email: string;
  isAdmin: boolean;
  onEmailChange: (value: string) => void;
  onResetPassword: () => void;
  onDeleteAccount: () => void;
}

export function AccountTab({
  email,
  isAdmin,
  onEmailChange,
  onResetPassword,
  onDeleteAccount,
}: AccountTabProps) {
  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription className="text-gray-300">
          Manage your account details and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AccountForm
          email={email}
          isAdmin={isAdmin}
          onEmailChange={onEmailChange}
          onResetPassword={onResetPassword}
          onDeleteAccount={onDeleteAccount}
        />
      </CardContent>
    </Card>
  );
}
