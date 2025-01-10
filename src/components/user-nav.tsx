"use client"

import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

interface UserNavProps {
  user: {
    email: string
  }
}

export function UserNav({ user }: UserNavProps) {
  const initials = user.email.charAt(0).toUpperCase()

  const handleSignOut = () => {
    // Delete the token cookie
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    window.location.href = "/sign-in"
  }

  const handleProfile = () => {
    window.location.href = "/profile"
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="bg-transparent h-8 w-8 p-0">
            <Avatar className="h-8 w-8 cursor-pointer border border-white/20">
              <AvatarImage src="" alt={user.email} />
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
  )
} 