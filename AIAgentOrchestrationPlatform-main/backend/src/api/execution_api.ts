import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { addExecutionJob } from '../services/background_jobs'
import { z } from 'zod'

const router = Router()

const executeAgentSchema = z.object({
  agentId: z.string(),
  input: z.any().optional(),
  configuration: z.record(z.any()).optional(),
  environment: z.enum(['development', 'staging', 'production']).default('development'),
  trigger: z.enum(['manual', 'scheduled', 'webhook']).default('manual'),
})

// POST /api/executions - Start agent execution
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = executeAgentSchema.parse(req.body)

    const agent = await prisma.agent.findFirst({
      where: { id: data.agentId, userId: req.user!.id },
    })

    if (!agent) return res.status(404).json({ error: 'Agent not found' })
    if (!agent.isActive) return res.status(400).json({ error: 'Agent is not active' })

    const runningExecution = await prisma.execution.findFirst({
      where: { agentId: data.agentId, status: { in: ['PENDING', 'RUNNING'] } },
    })

    if (runningExecution) {
      return res.status(409).json({ error: 'Agent is already running', executionId: runningExecution.id })
    }

    await prisma.agent.update({ where: { id: data.agentId }, data: { status: 'RUNNING' } })

    const execution = await prisma.execution.create({
      data: {
        agentId: data.agentId,
        userId: req.user!.id,
        status: 'PENDING',
        input: data.input,
        trigger: data.trigger,
        environment: data.environment,
      },
    })

    await addExecutionJob({
      executionId: execution.id,
      agentId: data.agentId,
      userId: req.user!.id,
      input: data.input,
      configuration: data.configuration || {},
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'EXECUTION_STARTED',
        resourceType: 'EXECUTION',
        resourceId: execution.id,
        details: { agentId: data.agentId, agentName: agent.name, trigger: data.trigger },
      },
    })

    res.status(201).json({ executionId: execution.id, status: 'started' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Error starting execution:', error)
    res.status(500).json({ error: 'Failed to start execution' })
  }
})

// GET /api/executions
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { agentId, status, page = '1', limit = '20' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = { userId: req.user!.id }
    if (agentId) where.agentId = agentId
    if (status) where.status = status

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { startedAt: 'desc' },
        include: {
          agent: { select: { id: true, name: true, framework: true } },
          logs: { take: 5, orderBy: { timestamp: 'desc' } },
        },
      }),
      prisma.execution.count({ where }),
    ])

    res.json({ executions, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } })
  } catch (error) {
    console.error('Error fetching executions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/executions/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const execution = await prisma.execution.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        agent: { select: { id: true, name: true, framework: true, configuration: true } },
        logs: { orderBy: { timestamp: 'asc' } },
      },
    })

    if (!execution) return res.status(404).json({ error: 'Execution not found' })
    res.json(execution)
  } catch (error) {
    console.error('Error fetching execution:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/executions/:id - Cancel execution
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const execution = await prisma.execution.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { agent: true },
    })

    if (!execution) return res.status(404).json({ error: 'Execution not found' })

    if (!['PENDING', 'RUNNING'].includes(execution.status)) {
      return res.status(400).json({ error: 'Cannot cancel execution in current status' })
    }

    await prisma.execution.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', completedAt: new Date() },
    })

    await prisma.agent.update({ where: { id: execution.agentId }, data: { status: 'IDLE' } })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'EXECUTION_CANCELLED',
        resourceType: 'EXECUTION',
        resourceId: req.params.id,
        details: { agentId: execution.agentId, agentName: execution.agent.name },
      },
    })

    res.json({ message: 'Execution cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling execution:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/executions/:id/logs
router.get('/:id/logs', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { level, limit = '100', offset = '0' } = req.query

    const execution = await prisma.execution.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    })

    if (!execution) return res.status(404).json({ error: 'Execution not found' })

    const where: any = { executionId: req.params.id }
    if (level) where.level = level

    const limitNum = parseInt(limit as string)
    const offsetNum = parseInt(offset as string)

    const [logs, total] = await Promise.all([
      prisma.executionLog.findMany({ where, skip: offsetNum, take: limitNum, orderBy: { timestamp: 'asc' } }),
      prisma.executionLog.count({ where }),
    ])

    res.json({ logs, pagination: { offset: offsetNum, limit: limitNum, total, hasMore: offsetNum + logs.length < total } })
  } catch (error) {
    console.error('Error fetching execution logs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
