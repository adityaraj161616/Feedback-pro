"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
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
import { Badge } from "@/components/ui/badge"
import { Shield, Settings, LogOut, Download, Users, Zap } from "lucide-react"
import Link from "next/link"

interface AdminHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/admin/export")
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `feedback-export-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
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
            <Badge className="bg-red-500 text-white ml-2">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/admin" className="text-gray-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/forms" className="text-gray-300 hover:text-white transition-colors">
              Forms
            </Link>
            <Link href="/admin/users" className="text-gray-300 hover:text-white transition-colors">
              Users
            </Link>
            <Link href="/admin/analytics" className="text-gray-300 hover:text-white transition-colors">
              Analytics
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Export Data */}
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                      {user.name?.charAt(0) || "A"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                    <p className="text-xs leading-none text-gray-400">{user.email}</p>
                    <Badge className="bg-red-500 text-white w-fit mt-1">Admin</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                  <Users className="mr-2 h-4 w-4" />
                  <span>User Management</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
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
