import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { z } from 'zod'
import crypto from 'crypto'

const router = Router()

const createKeySchema = z.object({
  name: z.string().min(1).max(100),
  permissions: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
})

function generateApiKey(): string {
  return 'ak_' + crypto.randomBytes(32).toString('hex')
}

function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex')
}

// GET /api/api-keys
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: req.user!.id },
      select: { id: true, name: true, permissions: true, isActive: true, lastUsedAt: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ keys })
  } catch (error) {
    console.error('Error fetching API keys:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/api-keys
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, permissions, expiresAt } = createKeySchema.parse(req.body)
    const rawKey = generateApiKey()
    const keyHash = hashApiKey(rawKey)

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        permissions,
        userId: req.user!.id,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
      select: { id: true, name: true, permissions: true, isActive: true, expiresAt: true, createdAt: true },
    })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'API_KEY_CREATED',
        resourceType: 'API_KEY',
        resourceId: apiKey.id,
        details: { name },
      },
    })

    // Return raw key only once
    res.status(201).json({ ...apiKey, key: rawKey })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Error creating API key:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/api-keys/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await prisma.apiKey.deleteMany({
      where: { id: req.params.id, userId: req.user!.id },
    })

    if (result.count === 0) return res.status(404).json({ error: 'API key not found' })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'API_KEY_REVOKED',
        resourceType: 'API_KEY',
        resourceId: req.params.id,
        details: {},
      },
    })

    res.json({ message: 'API key deleted successfully' })
  } catch (error) {
    console.error('Error deleting API key:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/api-keys/:id/revoke
router.patch('/:id/revoke', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const result = await prisma.apiKey.updateMany({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isActive: false },
    })

    if (result.count === 0) return res.status(404).json({ error: 'API key not found' })

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'API_KEY_REVOKED',
        resourceType: 'API_KEY',
        resourceId: req.params.id,
        details: {},
      },
    })

    res.json({ message: 'API key revoked successfully' })
  } catch (error) {
    console.error('Error revoking API key:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
