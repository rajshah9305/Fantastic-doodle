import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { createServer } from 'http'
import dotenv from 'dotenv'
import { rateLimit } from 'express-rate-limit'

import { securityMiddleware } from './middleware/security'
import { healthCheck } from './services/health_monitoring'
import { setupWebSocket } from './services/realtime_websocket'
import { setupBackgroundJobs } from './services/background_jobs'
import { setupWebhooks } from './services/webhook_system'
import { CEREBRAS_MODELS } from './services/cerebras_client'

import agentRoutes from './api/agent_api_routes'
import executionRoutes from './api/execution_api'
import authRoutes from './api/auth_routes'
import apiKeyRoutes from './api/api_key_routes'
import webhookRoutes from './api/webhook_routes'
import analyticsRoutes from './api/analytics_routes'

import { prisma } from './lib/prisma'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const server = createServer(app)

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
)

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  })
)

app.use(
  rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  })
)

app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(securityMiddleware)

// Health check
app.get('/health', healthCheck)

// API info
app.get('/api', (_req, res) => {
  res.json({
    name: 'AI Agent Orchestrator API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      agents: '/api/agents',
      executions: '/api/executions',
      auth: '/api/auth',
      apiKeys: '/api/api-keys',
      webhooks: '/api/webhooks',
      analytics: '/api/dashboard',
    },
  })
})

// Cerebras models endpoint — sourced from live model list
app.get('/api/cerebras/models', (_req, res) => {
  res.json({
    provider: 'cerebras',
    base_url: 'https://api.cerebras.ai/v1',
    models: [
      {
        id: CEREBRAS_MODELS.LLAMA_3_1_8B,
        name: 'Llama 3.1 8B',
        parameters: '8B',
        speed_tps: 2200,
        context_window: 8192,
        max_completion_tokens: 8192,
        tier: 'production',
        supports_reasoning: false,
      },
      {
        id: CEREBRAS_MODELS.GPT_OSS_120B,
        name: 'OpenAI GPT OSS 120B',
        parameters: '120B',
        speed_tps: 3000,
        context_window: 32768,
        max_completion_tokens: 32768,
        tier: 'production',
        supports_reasoning: true,
        reasoning_efforts: ['low', 'medium', 'high'],
      },
      {
        id: CEREBRAS_MODELS.QWEN_3_235B,
        name: 'Qwen 3 235B Instruct',
        parameters: '235B',
        speed_tps: 1400,
        context_window: 16384,
        max_completion_tokens: 20000,
        tier: 'preview',
        supports_reasoning: false,
      },
      {
        id: CEREBRAS_MODELS.ZAI_GLM_4_7,
        name: 'Z.ai GLM 4.7',
        parameters: '355B',
        speed_tps: 1000,
        context_window: 8192,
        max_completion_tokens: 8192,
        tier: 'preview',
        supports_reasoning: true,
        reasoning_efforts: ['none'],
      },
    ],
  })
})

// Routes
app.use('/api/agents', agentRoutes)
app.use('/api/executions', executionRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/api-keys', apiKeyRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api/dashboard', analyticsRoutes)

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON payload' })
  }
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  })
})

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

async function initializeServices() {
  setupWebSocket(server)
  setupBackgroundJobs()
  setupWebhooks()
  console.log('✅ All services initialized')
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...')
  await prisma.$disconnect()
  server.close(() => process.exit(0))
})

async function startServer() {
  try {
    await prisma.$connect()
    console.log('✅ Database connected')
    await initializeServices()
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📊 Health: http://localhost:${PORT}/health`)
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app
