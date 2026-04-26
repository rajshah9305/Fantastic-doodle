"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { X, User, Mail, Calendar, Award, Activity, Settings, LogOut } from "lucide-react"
import { useAuthContext } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { format } from "date-fns"

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user, logout } = useAuthContext()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
    onClose()
    router.push('/')
  }

  if (!user) return null

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 pointer-events-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 h-full w-full max-w-md bg-black/90 backdrop-blur-md border-l border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Profile</h2>
                    <p className="text-orange-500 text-sm">AgentOrchestra</p>
                  </div>
                </div>
                <Button onClick={onClose} variant="ghost" size="sm" className="text-white/60 hover:text-white rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <Card className="bg-white/5 border-white/10 p-6 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-orange-500 text-black font-bold text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">{user.name || 'User'}</h3>
                    <p className="text-white/60 text-sm">{user.role}</p>
                    <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/50 mt-2 text-xs">
                      {user.role === 'ADMIN' ? 'Admin' : 'Member'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-white/80">
                    <Mail className="w-4 h-4 text-orange-500 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                    Joined {format(new Date(user.createdAt), 'MMMM yyyy')}
                  </div>
                </div>
              </Card>

              <Card className="bg-white/5 border-white/10 p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-orange-500" />
                  <h4 className="text-white font-semibold">Account Info</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">User ID</span>
                    <span className="text-white/80 font-mono text-xs">{user.id.slice(0, 12)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Role</span>
                    <span className="text-white">{user.role}</span>
                  </div>
                </div>
              </Card>

              <Separator className="bg-white/10 mb-6" />

              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <Activity className="w-4 h-4 mr-3" />Activity History
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent">
                  <Settings className="w-4 h-4 mr-3" />Account Settings
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full justify-start border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-3" />Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
