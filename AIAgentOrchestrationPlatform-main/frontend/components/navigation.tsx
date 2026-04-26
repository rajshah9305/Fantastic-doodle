"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Search, Home, BarChart3, LogIn } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/components/auth-provider"

interface NavigationProps {
  onPanelChange?: (panel: string | null) => void
  activePanel?: string | null
}

export function Navigation({ onPanelChange, activePanel }: NavigationProps) {
  const [notifications] = useState(0)
  const pathname = usePathname()
  const { user } = useAuthContext()

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute top-0 left-0 right-0 z-20 p-6"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-black font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">AgentOrchestra</h1>
            <p className="text-orange-500 text-xs font-medium">AI Agent Orchestration</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className={`text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all ${pathname === "/" ? "bg-orange-500/20 text-orange-500" : ""}`}
            >
              <Home className="w-4 h-4 mr-2" />Home
            </Button>
          </Link>
          {user && (
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className={`text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all ${pathname === "/dashboard" ? "bg-orange-500/20 text-orange-500" : ""}`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />Dashboard
              </Button>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
            <Search className="w-4 h-4" />
          </Button>

          {user ? (
            <>
              <div className="relative">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10 rounded-full">
                  <Bell className="w-4 h-4" />
                </Button>
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-orange-500 text-black text-xs min-w-5 h-5 flex items-center justify-center p-0">
                    {notifications}
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPanelChange?.(activePanel === "profile" ? null : "profile")}
                className={`text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all ${activePanel === "profile" ? "bg-orange-500/20 text-orange-500" : ""}`}
              >
                <User className="w-4 h-4 mr-2" />
                {user.name?.split(' ')[0] || 'Profile'}
              </Button>

              {pathname === "/dashboard" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPanelChange?.(activePanel === "settings" ? null : "settings")}
                  className={`text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all ${activePanel === "settings" ? "bg-orange-500/20 text-orange-500" : ""}`}
                >
                  <Settings className="w-4 h-4 mr-2" />Settings
                </Button>
              )}
            </>
          ) : (
            <Link href="/auth">
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-black font-semibold rounded-full"
              >
                <LogIn className="w-4 h-4 mr-2" />Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
