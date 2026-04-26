"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAgents } from "@/hooks/use-agents"
import { useExecutions } from "@/hooks/use-executions"
import { Agent } from "@/lib/api"
import { Activity, Bot, Plus, Play, Trash2, Settings, Loader2 } from "lucide-react"
import { toast } from "sonner"

const FRAMEWORKS = [
  'AUTOGEN', 'CREWAI', 'AUTOGPT', 'BABYAGI', 'LANGGRAPH',
  'METAGPT', 'CAMELAI', 'CEREBRAS', 'CEREBRAS_AUTOGEN'
]

export function AgentsTab() {
  const { agents, loading, createAgent, deleteAgent } = useAgents()
  const { startExecution } = useExecutions()
  const [creating, setCreating] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    framework: 'CEREBRAS',
    description: '',
    configuration: '{\n  "model": "llama-3.1-8b-instruct",\n  "temperature": 0.7,\n  "max_tokens": 2048\n}',
  })

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error('Agent name is required')
    let config: Record<string, unknown>
    try {
      config = JSON.parse(form.configuration)
    } catch {
      return toast.error('Invalid JSON configuration')
    }
    setCreating(true)
    try {
      await createAgent({
        name: form.name,
        framework: form.framework,
        description: form.description || undefined,
        configuration: config,
      })
      toast.success('Agent created successfully')
      setDialogOpen(false)
      setForm({ name: '', framework: 'CEREBRAS', description: '', configuration: '{\n  "model": "llama-3.1-8b-instruct",\n  "temperature": 0.7,\n  "max_tokens": 2048\n}' })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create agent')
    } finally {
      setCreating(false)
    }
  }

  const handleRun = async (agent: Agent) => {
    setRunning(agent.id)
    try {
      await startExecution({ agentId: agent.id, trigger: 'manual' })
      toast.success(`${agent.name} execution started`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start execution')
    } finally {
      setRunning(null)
    }
  }

  const handleDelete = async (agent: Agent) => {
    if (!confirm(`Delete "${agent.name}"?`)) return
    try {
      await deleteAgent(agent.id)
      toast.success('Agent deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete agent')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Your Agents</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-black/90 border-white/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-white/80 mb-1.5 block">Name *</Label>
                <Input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="My AI Agent"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-1.5 block">Framework</Label>
                <Select value={form.framework} onValueChange={v => setForm(f => ({ ...f, framework: v }))}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FRAMEWORKS.map(fw => (
                      <SelectItem key={fw} value={fw}>{fw}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white/80 mb-1.5 block">Description</Label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What does this agent do?"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <Label className="text-white/80 mb-1.5 block">Configuration (JSON)</Label>
                <Textarea
                  value={form.configuration}
                  onChange={e => setForm(f => ({ ...f, configuration: e.target.value }))}
                  rows={6}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-black font-semibold"
              >
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Create Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <Card className="bg-white/5 border-white/10 p-12 text-center">
          <Bot className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">No agents yet. Create your first agent to get started.</p>
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-white/5 backdrop-blur-md border-white/10 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-semibold truncate flex-1 mr-2">{agent.name}</h4>
                  <Badge className={`shrink-0 ${
                    agent.status === 'RUNNING' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                    agent.status === 'ERROR' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                    'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                  }`}>
                    {agent.status}
                  </Badge>
                </div>
                {agent.description && (
                  <p className="text-white/50 text-xs mb-3 line-clamp-2">{agent.description}</p>
                )}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-white/60">Framework:</span>
                    <span className="text-white">{agent.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Executions:</span>
                    <span className="text-white">{agent.totalExecutions}</span>
                  </div>
                  {agent.totalExecutions > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Success:</span>
                      <span className="text-green-400">
                        {Math.round((agent.successfulExecutions / agent.totalExecutions) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleRun(agent)}
                    disabled={running === agent.id || agent.status === 'RUNNING'}
                    className="flex-1 bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border-0"
                  >
                    {running === agent.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Play className="w-4 h-4 mr-1" />Run</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white/60 hover:bg-white/10 bg-transparent"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(agent)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
