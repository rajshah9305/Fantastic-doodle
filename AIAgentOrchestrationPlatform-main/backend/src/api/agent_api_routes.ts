import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { z } from 'zod'

const router = Router()

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  framework: z.enum([
    'AUTOGEN', 'METAGPT', 'CREWAI', 'AUTOGPT', 'BABYAGI',
    'LANGGRAPH', 'CAMELAI', 'AGENTVERSE', 'OPENAGENTS', 'MINIAGI', 'ORCA',
    'CEREBRAS', 'CEREBRAS_AUTOGEN'
  ]),
  description: z.string().optional(),
  configuration: z.record(z.any()),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
})

// GET /api/agents
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { framework, status, page = '1', limit = '10' } = req.query
    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = { userId: req.user!.id }
    if (framework) where.framework = framework
    if (status) where.status = status

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          executions: { take: 1, orderBy: { createdAt: 'desc' } },
          _count: { select: { executions: true } },
        },
      }),
      prisma.agent.count({ where }),
    ])

    res.json({
      agents,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/agents
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = createAgentSchema.parse(req.body)
    const agent = await prisma.agent.create({
      data: { ...data, userId: req.user!.id, status: 'IDLE' },
      include: { _count: { select: { executions: true } } },
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'AGENT_CREATED',
        resourceType: 'AGENT',
        resourceId: agent.id,
        details: { agentName: agent.name, framework: agent.framework },
      },
    })

    res.status(201).json(agent)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Error creating agent:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/agents/:id
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const agent = await prisma.agent.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        executions: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { executions: true } },
      },
    })

    if (!agent) return res.status(404).json({ error: 'Agent not found' })
    res.json(agent)
  } catch (error) {
    console.error('Error fetching agent:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/agents/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = createAgentSchema.partial().parse(req.body)
    const result = await prisma.agent.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data,
    })

    if (result.count === 0) return res.status(404).json({ error: 'Agent not found' })

    const updated = await prisma.agent.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { executions: true } } },
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'AGENT_UPDATED',
        resourceType: 'AGENT',
        resourceId: req.params.id,
        details: { changes: data },
      },
    })

    res.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Error updating agent:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/agents/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await prisma.agent.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    })

    if (result.count === 0) return res.status(404).json({ error: 'Agent not found' })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'AGENT_DELETED',
        resourceType: 'AGENT',
        resourceId: req.params.id,
        details: {},
      },
    })

    res.json({ message: 'Agent deleted successfully' })
  } catch (error) {
    console.error('Error deleting agent:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
