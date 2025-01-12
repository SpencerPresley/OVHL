"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { useEffect, useState } from "react";
import { Images } from "@/constants/images";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface User {
  id: string;
  email: string;
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
  { id: "nhl", name: "NHL", logo: "/nhl_logo.png" },
  { id: "ahl", name: "AHL", logo: "/ahl_logo.png" },
  { id: "echl", name: "ECHL", logo: "/echl_logo.png" },
  { id: "chl", name: "CHL", logo: "/chl_logo.png" },
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
  const [user, setUser] = useState<User | null>(null);
  const [isLeaguesOpen, setIsLeaguesOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      }
    };

    checkAuth();
  }, []);

  /**
   * Navigation Links Configuration
   *
   * Centralized array of navigation links used by both desktop and mobile views.
   * Each link object contains:
   * @property {string} href - The target URL for the link
   * @property {string} label - The display text for the link
   */
  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "#", label: "News" },
  ];

  return (
    <nav className="nav-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <Image
            src={Images.LOGO_MAIN.path}
            alt="OVHL Logo"
            width={120}
            height={60}
            priority
          />
        </Link>

        {/* Desktop Navigation - Shown on md screens and up */}
        <div className="hidden md:flex gap-8 items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              {navigationLinks.map((link) => (
                <NavigationMenuItem key={link.label}>
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "cursor-pointer hover:text-blue-400",
                      )}
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="cursor-pointer hover:text-blue-400">
                  Leagues
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    {leagues.map((league) => (
                      <li key={league.id}>
                        <Link
                          href={`/leagues/${league.id}`}
                          className="flex items-center space-x-4 rounded-md p-3 hover:bg-accent"
                        >
                          <Image
                            src={league.logo}
                            alt={`${league.name} Logo`}
                            width={40}
                            height={40}
                            className="rounded-sm object-contain"
                          />
                          <span className="text-sm font-medium">
                            {league.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                {user ? (
                  <UserNav user={user} />
                ) : (
                  <Button asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                )}
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
            <SheetContent side="right" className="w-[300px] card-gradient">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-lg hover:text-blue-400 transition cursor-pointer"
                  >
                    {link.label}
                  </Link>
                ))}
                <Collapsible
                  open={isLeaguesOpen}
                  onOpenChange={setIsLeaguesOpen}
                  className="w-full"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-lg font-semibold hover:text-blue-400 transition">
                    <span>Leagues</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isLeaguesOpen ? "transform rotate-180" : "",
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2">
                    {leagues.map((league) => (
                      <Link
                        key={league.id}
                        href={`/leagues/${league.id}`}
                        className="flex items-center space-x-2 py-2 pl-4 hover:text-blue-400 transition"
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
                {user ? (
                  <UserNav user={user} />
                ) : (
                  <Button asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
