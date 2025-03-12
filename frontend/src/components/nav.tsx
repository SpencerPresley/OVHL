'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { UserNav } from '@/components/user-nav';
import { useEffect, useState } from 'react';
import { Images } from '@/constants/images';
import { useSession } from 'next-auth/react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Menu, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NotificationBell } from '@/components/notification-bell';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

/**
 * League configuration type
 */
interface League {
  id: string;
  name: string;
  logo: string;
}

/**
 * Available leagues in the system
 */
const leagues: League[] = [
  { id: 'nhl', name: 'NHL', logo: '/nhl_logo.png' },
  { id: 'ahl', name: 'AHL', logo: '/ahl_logo.png' },
  { id: 'echl', name: 'ECHL', logo: '/echl_logo.png' },
  { id: 'chl', name: 'CHL', logo: '/chl_logo.png' },
];

/**
 * Navigation Component
 *
 * A responsive navigation bar that adapts to desktop and mobile views.
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Authentication state management
 * - Consistent styling across breakpoints
 * - Accessible navigation for screen readers
 * - Smooth hover effects and transitions
 */
export function Nav() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [user, setUser] = useState<User | null>(null);
  const [isLeaguesOpen, setIsLeaguesOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Only fetch user data if authenticated
      if (!isAuthenticated) {
        setUser(null);
        return;
      }
      
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
      }
    };

    checkAuth();
  }, [isAuthenticated]);

  /**
   * Navigation Links Configuration
   *
   * Centralized array of navigation links used by both desktop and mobile views.
   * Each link object contains:
   * @property {string} href - The target URL for the link
   * @property {string} label - The display text for the link
   */
  const navigationLinks = [
    { href: '/', label: 'Home' },
    { href: '#', label: 'News' },
  ];

  return (
    <nav className="nav-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <Image src={Images.LOGO_MAIN.path} alt="OVHL Logo" width={120} height={60} priority />
        </Link>

        {/* Desktop Navigation - Shown on md screens and up */}
        <div className="hidden md:flex gap-8 items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              {navigationLinks.map((link) => (
                <NavigationMenuItem key={link.label} className="flex">
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn('nav-menu-trigger', 'cursor-pointer hover:text-blue-400')}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem className="flex">
                <NavigationMenuTrigger className="nav-menu-trigger cursor-pointer hover:text-blue-400">
                  Leagues
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md border border-white/10">
                    {leagues.map((league) => (
                      <li key={league.id}>
                        <Link
                          href={`/leagues/${league.id}`}
                          className="flex items-center space-x-4 rounded-md p-3 hover:bg-white/10"
                        >
                          <Image
                            src={league.logo}
                            alt={`${league.name} Logo`}
                            width={40}
                            height={40}
                            className="rounded-sm object-contain"
                          />
                          <span className="text-sm font-medium">{league.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {user?.isAdmin && (
                <NavigationMenuItem className="flex">
                  <NavigationMenuTrigger className="nav-menu-trigger cursor-pointer hover:text-blue-400">
                    Admin
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-md border border-white/10">
                      <li>
                        <Link href="/admin" className="block rounded-md p-3 hover:bg-white/10">
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <div className="text-sm font-medium mb-2 px-3 text-muted-foreground">
                          League Management
                        </div>
                        <div className="h-px bg-white/10 mx-3 mb-3" />
                        <div className="grid grid-cols-2 gap-2">
                          {['NHL', 'AHL', 'ECHL', 'CHL'].map((league) => (
                            <Link
                              key={league}
                              href={`/admin/leagues/${league.toLowerCase()}/management`}
                              className="block rounded-md p-3 hover:bg-white/10"
                            >
                              {league} Management
                            </Link>
                          ))}
                        </div>
                      </li>
                      <li>
                        <div className="text-sm font-medium mb-2 px-3 text-muted-foreground">
                          Roster Management
                        </div>
                        <div className="h-px bg-white/10 mx-3 mb-3" />
                        <div className="grid grid-cols-2 gap-2">
                          {['NHL', 'AHL', 'ECHL', 'CHL'].map((league) => (
                            <Link
                              key={league}
                              href={`/admin/leagues/${league.toLowerCase()}/roster`}
                              className="block rounded-md p-3 hover:bg-white/10"
                            >
                              {league} Roster
                            </Link>
                          ))}
                        </div>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
              <NavigationMenuItem className="flex">
                {/* Right side - Auth, Notifications */}
                <div className="flex gap-4 items-center">
                  {isAuthenticated && <NotificationBell />}
                  {user ? (
                    <UserNav user={user} />
                  ) : (
                    <Link href="/sign-in">
                      <Button variant="outline" size="sm" className="bg-gradient-to-br from-blue-500 to-blue-600">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Mobile Navigation - Sheet menu triggered by hamburger button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent hover:text-blue-400"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] card-gradient overflow-hidden flex flex-col"
            >
              <div className="px-4 py-4 border-b border-white/10">
                <SheetTitle>Navigation</SheetTitle>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-4 px-4 py-4">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-base hover:text-blue-400 transition cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Collapsible
                    open={isLeaguesOpen}
                    onOpenChange={setIsLeaguesOpen}
                    className="w-full"
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full text-base hover:text-blue-400 transition">
                      <span>Leagues</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isLeaguesOpen ? 'transform rotate-180' : ''
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      {leagues.map((league) => (
                        <Link
                          key={league.id}
                          href={`/leagues/${league.id}`}
                          className="flex items-center gap-2 py-2 pl-2 hover:text-blue-400 transition"
                        >
                          <Image
                            src={league.logo}
                            alt={`${league.name} Logo`}
                            width={24}
                            height={24}
                            className="rounded-sm object-contain"
                          />
                          <span>{league.name}</span>
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                  {user?.isAdmin && (
                    <Collapsible
                      open={isAdminOpen}
                      onOpenChange={setIsAdminOpen}
                      className="w-full"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full text-base hover:text-blue-400 transition">
                        <span>Admin</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            isAdminOpen ? 'transform rotate-180' : ''
                          )}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2">
                        <Link
                          href="/admin"
                          className="block py-2 pl-2 hover:text-blue-400 transition"
                        >
                          Dashboard
                        </Link>
                        <div className="mt-4">
                          <div className="text-sm font-medium text-muted-foreground pl-2">
                            League Management
                          </div>
                          <div className="h-px bg-white/10 my-2" />
                          <div>
                            {['NHL', 'AHL', 'ECHL', 'CHL'].map((league) => (
                              <Link
                                key={league}
                                href={`/admin/leagues/${league.toLowerCase()}/management`}
                                className="block py-2 pl-2 hover:text-blue-400 transition"
                              >
                                {league} Management
                              </Link>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm font-medium text-muted-foreground pl-2">
                            Roster Management
                          </div>
                          <div className="h-px bg-white/10 my-2" />
                          <div>
                            {['NHL', 'AHL', 'ECHL', 'CHL'].map((league) => (
                              <Link
                                key={league}
                                href={`/admin/leagues/${league.toLowerCase()}/roster`}
                                className="block py-2 pl-2 hover:text-blue-400 transition"
                              >
                                {league} Roster
                              </Link>
                            ))}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              </div>
              {/* Mobile menu footer with auth/avatar */}
              <div className="border-t border-white/10 mt-auto">
                <div className="flex justify-between items-center p-4">
                  {isAuthenticated && <NotificationBell />}
                  {user ? (
                    <UserNav user={user} />
                  ) : (
                    <Link href="/sign-in">
                      <Button variant="outline" size="sm" className="bg-gradient-to-br from-blue-500 to-blue-600">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
