import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { UserService } from '@/lib/services/user-service';

// User interface from the original component
export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  isAdmin: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  password: string;
  resetToken: string | null;
  resetTokenExpiresAt: Date | null;
}

export interface ProfileFormData {
  name: string;
  username: string;
  email: string;
  avatarUrl: string | null;
}

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    username: '',
    email: '',
    avatarUrl: null,
  });

  const router = useRouter();
  const { toast } = useToast();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await UserService.getCurrentUser();
        if (!userData) {
          throw new Error('Not authenticated');
        }
        setUser(userData);
        setFormData({
          name: userData.name || '',
          username: userData.username || '',
          email: userData.email,
          avatarUrl: userData.avatarUrl,
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Update profile information
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedUser = await UserService.updateProfile(user.id, {
        name: formData.name,
        username: formData.username,
        email: formData.email,
      });

      setUser({
        ...updatedUser,
        avatarUrl: user.avatarUrl, // Preserve the avatar URL
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Update avatar
  const updateAvatar = async (file: File) => {
    if (!user) return;

    try {
      const updatedUser = await UserService.updateAvatar(user.id, file);
      setUser(updatedUser);
      setFormData((prev) => ({
        ...prev,
        avatarUrl: updatedUser.avatarUrl,
      }));
      toast({
        title: 'Avatar Updated',
        description: 'Your avatar has been successfully updated.',
      });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Remove avatar
  const removeAvatar = async () => {
    if (!user) return;

    try {
      const updatedUser = await UserService.removeAvatar(user.id);
      setUser(updatedUser);
      setFormData((prev) => ({
        ...prev,
        avatarUrl: null,
      }));
      toast({
        title: 'Avatar Removed',
        description: 'Your avatar has been successfully removed.',
      });
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      toast({
        title: 'Removal Failed',
        description: 'Failed to remove avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Reset password (placeholder for now)
  const resetPassword = async () => {
    toast({
      title: 'Coming Soon',
      description: 'Password reset functionality will be available soon.',
    });
  };

  // Delete account (placeholder for now)
  const deleteAccount = async () => {
    toast({
      title: 'Coming Soon',
      description: 'Account deletion functionality will be available soon.',
    });
  };

  // Update form field
  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Calculate user's initials
  const getUserInitials = () => {
    if (!user) return '';
    return user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
  };

  return {
    user,
    loading,
    formData,
    updateProfile,
    updateAvatar,
    removeAvatar,
    resetPassword,
    deleteAccount,
    updateFormField,
    getUserInitials,
  };
}
