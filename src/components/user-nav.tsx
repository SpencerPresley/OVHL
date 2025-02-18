'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
// import { cn } from "@/lib/utils"

/**
 * Props for the UserNav component
 * @property {Object} user - The authenticated user object
 * @property {string} user.email - The user's email address, used for display and avatar
 * @property {string | null} user.name - The user's name, if available
 * @property {string | null} user.avatarUrl - The user's avatar URL, if available
 */
interface UserNavProps {
  user: {
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

/**
 * User Navigation Component
 *
 * A navigation menu specifically for authenticated users.
 * Features:
 * - Avatar display with email initial fallback
 * - Dropdown menu for user-specific actions
 * - Accessible navigation structure
 * - Consistent styling with main navigation
 * - Responsive design that works in both desktop and mobile contexts
 *
 * @component
 * @param {UserNavProps} props - Component props
 * @returns {JSX.Element} Rendered user navigation menu
 */
export function UserNav({ user }: UserNavProps) {
  const initials = user.name 
    ? user.name.charAt(0).toUpperCase()
    : user.email.charAt(0).toUpperCase();

  /**
   * Handles user sign out
   * - Clears the authentication cookie
   * - Redirects to sign-in page
   */
  const handleSignOut = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/sign-in';
  };

  /**
   * Handles navigation to user profile
   */
  const handleProfile = () => {
    window.location.href = '/profile';
  };

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent h-8 w-8 p-0">
            <Avatar className="h-8 w-8 cursor-pointer border border-white/20">
              <AvatarImage src={user.avatarUrl || ""} alt={user.name || user.email} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="w-[200px] gap-3 p-4">
              <li className="font-medium mb-2">My Account</li>
              <li>
                <button
                  onClick={handleProfile}
                  className="w-full text-left cursor-pointer rounded-md p-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-blue-400"
                >
                  Profile
                </button>
              </li>
              <li>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left cursor-pointer rounded-md p-2 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-blue-400"
                >
                  Log out
                </button>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
