"use client"

import { useState, useRef, useEffect } from "react"
import { signOut } from "next-auth/react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Settings, LogOut, Plus, Zap } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [notifications, setNotifications] = useState(3)
  const bellRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Bell notification animation
    if (notifications > 0) {
      gsap.to(bellRef.current, {
        rotation: 15,
        duration: 0.1,
        repeat: 5,
        yoyo: true,
        ease: "power2.inOut",
      })
    }
  }, [notifications])

  const handleCreateForm = () => {
    // Navigate to form builder
    window.location.href = "/form-builder"
  }

  return (
    <header className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-purple-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              FeedbackPro
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/forms" className="text-gray-300 hover:text-white transition-colors">
              Forms
            </Link>
            <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </Link>
            {user.role === "admin" && (
              <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Create Form Button */}
            <Button
              onClick={handleCreateForm}
              className="magnetic-btn bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>

            {/* Notifications */}
            <Button ref={bellRef} variant="ghost" size="icon" className="relative text-gray-300 hover:text-white">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                    <p className="text-xs leading-none text-gray-400">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
