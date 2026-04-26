"use client"

import { useState, useEffect, useCallback } from 'react'
import { api, Agent, CreateAgentInput } from '@/lib/api'

export function useAgents(params?: { framework?: string; status?: string; page?: number; limit?: number }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getAgents(params)
      setAgents(res.agents)
      setTotal(res.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => {
    fetch()
  }, [fetch])

  const createAgent = async (data: CreateAgentInput) => {
    const agent = await api.createAgent(data)
    setAgents(prev => [agent, ...prev])
    setTotal(prev => prev + 1)
    return agent
  }

  const updateAgent = async (id: string, data: Partial<CreateAgentInput>) => {
    const updated = await api.updateAgent(id, data)
    setAgents(prev => prev.map(a => a.id === id ? updated : a))
    return updated
  }

  const deleteAgent = async (id: string) => {
    await api.deleteAgent(id)
    setAgents(prev => prev.filter(a => a.id !== id))
    setTotal(prev => prev - 1)
  }

  return { agents, total, loading, error, refetch: fetch, createAgent, updateAgent, deleteAgent }
}
