import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'

const router = Router()

function getDateRange(timeframe: string): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (timeframe) {
    case '24h': start.setHours(start.getHours() - 24); break
    case '7d': start.setDate(start.getDate() - 7); break
    case '30d': start.setDate(start.getDate() - 30); break
    case '90d': start.setDate(start.getDate() - 90); break
    default: start.setDate(start.getDate() - 7)
  }

  return { start, end }
}

// GET /api/dashboard
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const timeframe = (req.query.timeframe as string) || '7d'
    const dateRange = getDateRange(timeframe)

    const [
      activeAgents,
      totalExecutions,
      completedExecutions,
      failedExecutions,
      savedConfigs,
      recentExecutions,
    ] = await Promise.all([
      prisma.agent.count({ where: { userId, isActive: true } }),
      prisma.execution.count({ where: { userId, startedAt: { gte: dateRange.start } } }),
      prisma.execution.count({ where: { userId, status: 'COMPLETED', startedAt: { gte: dateRange.start } } }),
      prisma.execution.count({ where: { userId, status: 'FAILED', startedAt: { gte: dateRange.start } } }),
      prisma.savedConfiguration.count({ where: { userId } }),
      prisma.execution.findMany({
        where: { userId },
        orderBy: { startedAt: 'desc' },
        take: 10,
        include: { agent: { select: { id: true, name: true, framework: true } } },
      }),
    ])

    const successRate = totalExecutions > 0
      ? Math.round((completedExecutions / totalExecutions) * 100)
      : 0

    const avgDuration = await prisma.execution.aggregate({
      where: { userId, status: 'COMPLETED', startedAt: { gte: dateRange.start } },
      _avg: { duration: true },
    })

    res.json({
      metrics: {
        activeAgents,
        totalExecutions,
        completedExecutions,
        failedExecutions,
        successRate,
        savedConfigs,
        avgDuration: Math.round(avgDuration._avg.duration || 0),
      },
      recentExecutions,
      timeframe,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/dashboard/frameworks
router.get('/frameworks', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const timeframe = (req.query.timeframe as string) || '7d'
    const dateRange = getDateRange(timeframe)

    const frameworkStats = await prisma.execution.groupBy({
      by: ['agentId'],
      where: { userId, startedAt: { gte: dateRange.start } },
      _count: { id: true },
    })

    const agentIds = frameworkStats.map(s => s.agentId)
    const agents = await prisma.agent.findMany({
      where: { id: { in: agentIds } },
      select: { id: true, framework: true },
    })

    const agentMap = new Map(agents.map(a => [a.id, a.framework]))
    const byFramework: Record<string, number> = {}

    for (const stat of frameworkStats) {
      const framework = agentMap.get(stat.agentId) || 'UNKNOWN'
      byFramework[framework] = (byFramework[framework] || 0) + stat._count.id
    }

    res.json({ frameworks: byFramework, timeframe })
  } catch (error) {
    console.error('Error fetching framework stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/dashboard/trends
router.get('/trends', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id
    const timeframe = (req.query.timeframe as string) || '7d'
    const dateRange = getDateRange(timeframe)

    const executions = await prisma.execution.findMany({
      where: { userId, startedAt: { gte: dateRange.start, lte: dateRange.end } },
      select: { startedAt: true, status: true, duration: true, cost: true },
      orderBy: { startedAt: 'asc' },
    })

    // Group by day
    const byDay: Record<string, { total: number; completed: number; failed: number; cost: number }> = {}

    for (const exec of executions) {
      const day = exec.startedAt.toISOString().split('T')[0]
      if (!byDay[day]) byDay[day] = { total: 0, completed: 0, failed: 0, cost: 0 }
      byDay[day].total++
      if (exec.status === 'COMPLETED') byDay[day].completed++
      if (exec.status === 'FAILED') byDay[day].failed++
      byDay[day].cost += exec.cost || 0
    }

    const trends = Object.entries(byDay).map(([date, data]) => ({ date, ...data }))

    res.json({ trends, timeframe })
  } catch (error) {
    console.error('Error fetching trends:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
