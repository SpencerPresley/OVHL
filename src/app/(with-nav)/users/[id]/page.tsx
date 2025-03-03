import React from 'react';
import { notFound } from 'next/navigation';
import { UserProfileView } from './user-profile-view';
import { UserService } from '@/lib/services/user-service';

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const user = await UserService.getUserById(id);

  if (!user) {
    notFound();
  }

  return <UserProfileView user={user} />;
}
