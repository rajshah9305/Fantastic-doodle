"use client"

import { Suspense, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"
import { MetricsCards } from "@/components/metrics-cards"
import { FrameworkGrid } from "@/components/framework-grid"
import { ConfigurationPanel } from "@/components/configuration-panel"
import { ProfilePanel } from "@/components/profile-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { AgentsTab } from "@/components/agents-tab"
import { MonitoringTab } from "@/components/monitoring-tab"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Bot, Network, Server, BarChart3, TrendingUp, Settings, Clock } from "lucide-react"
import { useAuthContext } from "@/components/auth-provider"
import { useDashboard } from "@/hooks/use-dashboard"
import { useExecutions } from "@/hooks/use-executions"
import { formatDistanceToNow } from "date-fns"

const SceneCanvas = dynamic(() => import("@/components/scene-canvas"), { ssr: false })

export default function Dashboard() {
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const { data: dashboard, loading: dashLoading } = useDashboard('7d')
  const { executions } = useExecutions({ limit: 5 })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  if (authLoading) return <LoadingSpinner />
  if (!user) return null

  const metrics = dashboard?.metrics

  return (
    <div className="relative w-full min-h-screen bg-black">
      <div className="fixed inset-0 opacity-20">
        <SceneCanvas />
      </div>

      <div className="relative z-10 w-full min-h-screen">
        <Navigation onPanelChange={setActivePanel} activePanel={activePanel} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-24 pb-8 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    <span className="text-orange-500">Agent</span> Dashboard
                  </h1>
                  <p className="text-white/60">
                    Welcome back, {user.name || user.email.split('@')[0]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    Live
                  </Badge>
                  <Button
                    variant="outline"
                    className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10 bg-transparent"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <MetricsCards metrics={metrics} loading={dashLoading} />
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-white/5 border-white/10">
                <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">
                  <Activity className="w-4 h-4 mr-2" />Overview
                </TabsTrigger>
                <TabsTrigger value="agents" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">
                  <Bot className="w-4 h-4 mr-2" />Agents
                </TabsTrigger>
                <TabsTrigger value="frameworks" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">
                  <Network className="w-4 h-4 mr-2" />Frameworks
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-500">
                  <Server className="w-4 h-4 mr-2" />Monitoring
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">System Performance</h3>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Real-time</Badge>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Success Rate", value: metrics?.successRate ?? 0, color: "bg-green-500" },
                        { label: "Active Agents", value: Math.min((metrics?.activeAgents ?? 0) * 10, 100), color: "bg-orange-500" },
                        { label: "Executions Today", value: Math.min((metrics?.totalExecutions ?? 0) / 10, 100), color: "bg-blue-500" },
                        { label: "Avg Duration", value: Math.min((metrics?.avgDuration ?? 0) / 100, 100), color: "bg-purple-500" },
                      ].map((metric) => (
                        <div key={metric.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/80">{metric.label}</span>
                            <span className="text-white font-medium">{metric.value.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className={`h-2 rounded-full ${metric.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-white">Recent Executions</h3>
                      <Button variant="ghost" size="sm" className="text-orange-500 hover:bg-orange-500/10">
                        View All
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {executions.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-4">No executions yet</p>
                      ) : (
                        executions.slice(0, 5).map((exec, index) => (
                          <motion.div
                            key={exec.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div className={`p-2 rounded-full ${
                              exec.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                              exec.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                              exec.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              <Activity className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm truncate">{exec.agent?.name || 'Agent'}</p>
                              <p className="text-white/60 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}
                              </p>
                            </div>
                            <Badge className={`text-xs ${
                              exec.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                              exec.status === 'FAILED' ? 'bg-red-500/20 text-red-400' :
                              exec.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {exec.status}
                            </Badge>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>

                <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Deploy Agent", icon: Bot, color: "from-orange-500 to-red-500", tab: "agents" },
                      { label: "Add Framework", icon: Network, color: "from-blue-500 to-purple-500", tab: "frameworks" },
                      { label: "View Logs", icon: Activity, color: "from-green-500 to-teal-500", tab: "monitoring" },
                      { label: "Configure", icon: Settings, color: "from-purple-500 to-pink-500", tab: "overview" },
                    ].map((action, index) => (
                      <motion.div
                        key={action.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full h-20 flex-col gap-2 border-white/20 hover:bg-white/10 group bg-transparent"
                        >
                          <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-white/80 text-sm">{action.label}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="agents">
                <AgentsTab />
              </TabsContent>

              <TabsContent value="frameworks">
                <FrameworkGrid />
              </TabsContent>

              <TabsContent value="monitoring">
                <MonitoringTab />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        <ConfigurationPanel />
        <ProfilePanel isOpen={activePanel === "profile"} onClose={() => setActivePanel(null)} />
        <SettingsPanel isOpen={activePanel === "settings"} onClose={() => setActivePanel(null)} />
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <div />
      </Suspense>
    </div>
  )
}
