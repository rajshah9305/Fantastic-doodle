"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Network, Activity, CheckCircle, TrendingUp } from "lucide-react"

interface MetricsData {
  activeAgents: number
  totalExecutions: number
  successRate: number
  avgDuration: number
}

interface MetricsCardsProps {
  metrics?: MetricsData | null
  loading?: boolean
}

export function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  const items = [
    {
      icon: Bot,
      label: "Active Agents",
      value: loading ? "—" : String(metrics?.activeAgents ?? 0),
      change: "+23%",
      trend: "up" as const,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Currently deployed",
    },
    {
      icon: Activity,
      label: "Executions",
      value: loading ? "—" : String(metrics?.totalExecutions ?? 0),
      change: "+156%",
      trend: "up" as const,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "This period",
    },
    {
      icon: CheckCircle,
      label: "Success Rate",
      value: loading ? "—" : `${metrics?.successRate ?? 0}%`,
      change: "+5%",
      trend: "up" as const,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Completion rate",
    },
    {
      icon: Network,
      label: "Avg Duration",
      value: loading ? "—" : `${((metrics?.avgDuration ?? 0) / 1000).toFixed(1)}s`,
      change: "-12%",
      trend: "up" as const,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Per execution",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6 text-center hover:bg-white/10 transition-all duration-300 group">
            <div className="flex flex-col items-center space-y-4">
              <div className={`p-4 rounded-xl ${metric.bgColor} ${metric.color} group-hover:scale-110 transition-transform duration-300`}>
                <metric.icon className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <p className={`text-3xl font-bold ${metric.color}`}>{metric.value}</p>
                  <Badge variant="outline" className="text-xs border-0 bg-green-500/20 text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {metric.change}
                  </Badge>
                </div>
                <p className="text-white/60 text-sm font-medium">{metric.label}</p>
                <p className="text-white/40 text-xs">{metric.description}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
