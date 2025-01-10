"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { useEffect, useState } from "react"
import { Images } from "@/constants/images"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface User {
  id: string
  email: string
}

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
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user", {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      }
    }

    checkAuth()
  }, [])

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
    { href: "#", label: "Standings" },
    { href: "#", label: "Schedule" },
    { href: "#", label: "Teams" },
    { href: "#", label: "News" },
  ]

  return (
    <nav className="nav-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Image
          src={Images.LOGO_MAIN.path}
          alt="OVHL Logo"
          width={120}
          height={60}
          priority
        />
        
        {/* Desktop Navigation - Shown on md screens and up */}
        <div className="hidden md:flex gap-8 items-center">
          <NavigationMenu>
            <NavigationMenuList className="gap-6">
              {navigationLinks.map((link) => (
                <NavigationMenuItem key={link.label}>
                  <Link href={link.href} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), "cursor-pointer hover:text-blue-400")}>
                      {link.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
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
              <Button variant="ghost" size="icon" className="hover:bg-transparent hover:text-blue-400">
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
  )
} 