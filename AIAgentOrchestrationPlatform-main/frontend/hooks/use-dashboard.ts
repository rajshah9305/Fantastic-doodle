"use client"

import { useState, useEffect, useCallback } from 'react'
import { api, DashboardData, TrendData } from '@/lib/api'

export function useDashboard(timeframe = '7d') {
  const [data, setData] = useState<DashboardData | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [frameworkStats, setFrameworkStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [dashboard, trendsRes, frameworksRes] = await Promise.all([
        api.getDashboard(timeframe),
        api.getDashboardTrends(timeframe),
        api.getDashboardFrameworks(timeframe),
      ])
      setData(dashboard)
      setTrends(trendsRes.trends)
      setFrameworkStats(frameworksRes.frameworks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [timeframe])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, trends, frameworkStats, loading, error, refetch: fetch }
}
