"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useExecutions } from "@/hooks/use-executions"
import { Execution } from "@/lib/api"
import { Activity, Terminal, RefreshCw, Loader2, XCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export function MonitoringTab() {
  const { executions, loading, refetch, cancelExecution } = useExecutions({ limit: 20 })
  const [cancelling, setCancelling] = useState<string | null>(null)

  const handleCancel = async (exec: Execution) => {
    setCancelling(exec.id)
    try {
      await cancelExecution(exec.id)
    } finally {
      setCancelling(null)
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'FAILED': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'RUNNING': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'CANCELLED': return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Execution Monitor</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="border-white/20 text-white/60 hover:bg-white/10 bg-transparent"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-blue-500" />
            <h4 className="text-lg font-semibold text-white">System Resources</h4>
            <Badge className="bg-green-500/20 text-green-500 text-xs">Healthy</Badge>
          </div>
          <div className="space-y-5">
            {[
              { label: "Memory Usage", value: Math.round((performance?.memory as any)?.usedJSHeapSize / (performance?.memory as any)?.totalJSHeapSize * 100) || 45, color: "bg-blue-500" },
              { label: "Active Executions", value: executions.filter(e => e.status === 'RUNNING').length * 10, color: "bg-orange-500" },
              { label: "Success Rate", value: executions.length > 0 ? Math.round(executions.filter(e => e.status === 'COMPLETED').length / executions.length * 100) : 0, color: "bg-green-500" },
              { label: "Queue Depth", value: executions.filter(e => e.status === 'PENDING').length * 5, color: "bg-purple-500" },
            ].map((metric) => (
              <div key={metric.label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/80 font-medium text-sm">{metric.label}</span>
                  <span className="text-white font-bold text-sm">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white/5 border-white/10 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Terminal className="w-5 h-5 text-green-500" />
            <h4 className="text-lg font-semibold text-white">Live Executions</h4>
            <Badge className="bg-blue-500/20 text-blue-500 text-xs">
              {executions.filter(e => e.status === 'RUNNING').length} running
            </Badge>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : executions.length === 0 ? (
              <p className="text-white/40 text-sm text-center py-8">No executions found</p>
            ) : (
              executions.map((exec, index) => (
                <motion.div
                  key={exec.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{exec.agent?.name || 'Agent'}</p>
                    <p className="text-white/40 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(exec.startedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge className={`text-xs shrink-0 ${statusColor(exec.status)}`}>
                    {exec.status}
                  </Badge>
                  {(exec.status === 'RUNNING' || exec.status === 'PENDING') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancel(exec)}
                      disabled={cancelling === exec.id}
                      className="text-red-400 hover:bg-red-500/10 p-1 h-auto"
                    >
                      {cancelling === exec.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
