import React from 'react';
import { notFound } from 'next/navigation';
import { UserProfileView } from './user-profile-view';
import { UserService } from '@/lib/services/user-service';

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const id = await params.id;

  const user = await UserService.getUserById(id);

  if (!user) {
    notFound();
  }

  return <UserProfileView user={user} />;
}
