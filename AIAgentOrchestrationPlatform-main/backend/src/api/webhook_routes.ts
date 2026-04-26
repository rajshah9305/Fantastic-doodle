import { Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import {
  registerWebhook,
  getUserWebhooks,
  updateWebhook,
  deleteWebhook,
  getWebhookLogs,
  testWebhook,
  verifyWebhookSignature,
} from '../services/webhook_system'
import { z } from 'zod'

const router = Router()

const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional(),
})

// GET /api/webhooks
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  const result = await getUserWebhooks(req.user!.id)
  if (!result.success) return res.status(500).json({ error: result.error })
  res.json(result)
})

// POST /api/webhooks
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { url, events, secret } = createWebhookSchema.parse(req.body)
    const result = await registerWebhook(req.user!.id, url, events, secret)
    if (!result.success) return res.status(500).json({ error: result.error })
    res.status(201).json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PUT /api/webhooks/:id
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const result = await updateWebhook(req.params.id, req.user!.id, req.body)
  if (!result.success) return res.status(500).json({ error: result.error })
  res.json(result)
})

// DELETE /api/webhooks/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  const result = await deleteWebhook(req.params.id, req.user!.id)
  if (!result.success) return res.status(500).json({ error: result.error })
  res.json(result)
})

// GET /api/webhooks/:id/logs
router.get('/:id/logs', authMiddleware, async (req: AuthRequest, res) => {
  const limit = parseInt((req.query.limit as string) || '50')
  const result = await getWebhookLogs(req.params.id, req.user!.id, limit)
  if (!result.success) return res.status(500).json({ error: result.error })
  res.json(result)
})

// POST /api/webhooks/:id/test
router.post('/:id/test', authMiddleware, async (req: AuthRequest, res) => {
  const result = await testWebhook(req.params.id, req.user!.id)
  if (!result.success) return res.status(500).json({ error: result.error })
  res.json(result)
})

export default router
