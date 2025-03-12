'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AvatarUpload } from '../avatar-upload';
import { ProfileForm } from '../profile-form';
import { ProfileFormData } from '@/hooks/use-user-profile';

interface ProfileTabProps {
  formData: {
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  initials: string;
  onAvatarUpload: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  onProfileSubmit: (e: React.FormEvent) => Promise<void>;
  onFieldChange: (field: string, value: string) => void;
}

export function ProfileTab({
  formData,
  initials,
  onAvatarUpload,
  onAvatarRemove,
  onProfileSubmit,
  onFieldChange,
}: ProfileTabProps) {
  return (
    <Card className="border-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription className="text-gray-300">
          Update your profile information visible to other users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarUpload
          imageUrl={formData.avatarUrl}
          initials={initials}
          name={formData.name}
          username={formData.username}
          onUpload={onAvatarUpload}
          onRemove={onAvatarRemove}
        />

        <Separator className="bg-white/10" />

        <ProfileForm
          formData={{ name: formData.name, username: formData.username }}
          onSubmit={onProfileSubmit}
          onChange={onFieldChange}
        />
      </CardContent>
    </Card>
  );
} 