'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface ProfileHeaderProps {
  userId: string;
}

export function ProfileHeader({ userId }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information
        </p>
      </div>
      <Link
        href={`/users/${userId}`}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary"
      >
        <ExternalLink className="h-4 w-4" />
        View Public Profile
      </Link>
    </div>
  );
}
