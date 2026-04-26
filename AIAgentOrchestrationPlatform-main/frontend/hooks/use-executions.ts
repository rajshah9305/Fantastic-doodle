"use client"

import { useState, useEffect, useCallback } from 'react'
import { api, Execution, StartExecutionInput } from '@/lib/api'

export function useExecutions(params?: { agentId?: string; status?: string; page?: number; limit?: number }) {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.getExecutions(params)
      setExecutions(res.executions)
      setTotal(res.pagination.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executions')
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => {
    fetch()
  }, [fetch])

  const startExecution = async (data: StartExecutionInput) => {
    const result = await api.startExecution(data)
    await fetch()
    return result
  }

  const cancelExecution = async (id: string) => {
    await api.cancelExecution(id)
    setExecutions(prev => prev.map(e => e.id === id ? { ...e, status: 'CANCELLED' as const } : e))
  }

  return { executions, total, loading, error, refetch: fetch, startExecution, cancelExecution }
}
