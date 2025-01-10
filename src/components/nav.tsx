"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { useEffect, useState } from "react"
import { Images } from "@/constants/images"

interface User {
  id: string
  email: string
}

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
        <div className="hidden md:flex gap-8 items-center">
          <Link href="#" className="hover:text-blue-400 transition">Home</Link>
          <Link href="#" className="hover:text-blue-400 transition">Standings</Link>
          <Link href="#" className="hover:text-blue-400 transition">Schedule</Link>
          <Link href="#" className="hover:text-blue-400 transition">Teams</Link>
          <Link href="#" className="hover:text-blue-400 transition">News</Link>
          {user ? (
            <UserNav user={user} />
          ) : (
            <Button asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
} 