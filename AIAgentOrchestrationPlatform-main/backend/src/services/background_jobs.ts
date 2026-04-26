import Bull from 'bull'
import { prisma } from '../lib/prisma'
import { emitToExecution, emitToUser } from './realtime_websocket'
import crypto from 'crypto'

// Create Redis connection
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

// Create queues
const executionQueue = new Bull('execution', redisUrl)
const webhookQueue = new Bull('webhook', redisUrl)
const notificationQueue = new Bull('notification', redisUrl)
const cleanupQueue = new Bull('cleanup', redisUrl)

export const setupBackgroundJobs = () => {
  // Execution queue processor
  executionQueue.process(async (job) => {
    const { executionId, agentId, userId, input, configuration } = job.data

    try {
      // Update execution status to running
      await prisma.execution.update({
        where: { id: executionId },
        data: { status: 'RUNNING', startedAt: new Date() }
      })

      emitToExecution(executionId, 'execution:started', {
        executionId,
        status: 'RUNNING',
        startedAt: new Date()
      })

      // Get agent details
      const agent = await prisma.agent.findUnique({ where: { id: agentId } })
      if (!agent) throw new Error('Agent not found')

      // Run through the real execution engine
      const { executionEngine } = await import('./execution_engine')
      const result = await executionEngine.getExecutionStatus(executionId)

      // If already handled by execution engine, just emit completion
      if (result && (result.status === 'COMPLETED' || result.status === 'FAILED')) {
        emitToExecution(executionId, `execution:${result.status.toLowerCase()}`, {
          executionId,
          status: result.status,
          output: result.output,
          duration: result.duration,
        })
        return { success: result.status === 'COMPLETED' }
      }

      // Otherwise run directly via execution engine context
      const { ExecutionEngine } = await import('./execution_engine')
      const engine = new ExecutionEngine()
      const execResult = await engine['runExecution'](executionId, {
        agentId,
        userId,
        input,
        configuration: configuration || {},
        environment: 'production',
        trigger: 'queue',
      })

      emitToExecution(executionId, execResult.success ? 'execution:completed' : 'execution:failed', {
        executionId,
        status: execResult.success ? 'COMPLETED' : 'FAILED',
        output: execResult.output,
        error: execResult.error,
        duration: execResult.duration,
      })

      await notificationQueue.add('execution_completed', {
        userId,
        executionId,
        agentId,
        status: execResult.success ? 'completed' : 'failed',
      })

      return { success: execResult.success, result: execResult }
    } catch (error) {
      await prisma.execution.update({
        where: { id: executionId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      emitToExecution(executionId, 'execution:failed', {
        executionId,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      await notificationQueue.add('execution_failed', {
        userId,
        executionId,
        agentId,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }
  })

  // Webhook queue processor
  webhookQueue.process(async (job) => {
    const { webhookId, event, data } = job.data
    
    try {
      // Get webhook configuration
      const webhook = await prisma.webhook.findUnique({
        where: { id: webhookId }
      })

      if (!webhook || !webhook.isActive) {
        throw new Error('Webhook not found or inactive')
      }

      // Send webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': createSignature(data, webhook.secret)
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`)
      }

      // Log successful webhook
      await prisma.webhookLog.create({
        data: {
          webhookId,
          event,
          status: 'SUCCESS',
          responseStatus: response.status,
          responseBody: await response.text()
        }
      })

    } catch (error) {
      // Log failed webhook
      await prisma.webhookLog.create({
        data: {
          webhookId,
          event,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })

      throw error
    }
  })

  // Notification queue processor
  notificationQueue.process(async (job) => {
    const { userId, type, data } = job.data
    
    try {
      // Get user preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, notificationPreferences: true }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Send email notification if enabled
      if (user.notificationPreferences?.email) {
        await sendEmailNotification(user.email, type, data)
      }

      // Send in-app notification
      emitToUser(userId, 'notification', {
        type,
        data,
        timestamp: new Date()
      })

    } catch (error) {
      console.error('Notification failed:', error)
      throw error
    }
  })

  // Cleanup queue processor (runs daily)
  cleanupQueue.process(async (job) => {
    try {
      // Clean up old execution logs (older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      await prisma.executionLog.deleteMany({
        where: {
          timestamp: {
            lt: thirtyDaysAgo
          }
        }
      })

      // Clean up old webhook logs (older than 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      await prisma.webhookLog.deleteMany({
        where: {
          createdAt: {
            lt: sevenDaysAgo
          }
        }
      })

      console.log('Cleanup completed successfully')
      
    } catch (error) {
      console.error('Cleanup failed:', error)
      throw error
    }
  })

  // Schedule cleanup job to run daily at 2 AM
  cleanupQueue.add('daily_cleanup', {}, {
    repeat: {
      cron: '0 2 * * *'
    }
  })

  console.log('✅ Background jobs initialized')
}

// Helper function to create webhook signature
function createSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(JSON.stringify(payload))
  return hmac.digest('hex')
}

// Helper function to send email notification
async function sendEmailNotification(email: string, type: string, data: any) {
  const { emailService } = await import('./notification_system')
  console.log(`Sending ${type} notification to ${email}`, data)
  // emailService.sendEmail can be called here with a constructed template
}

// Export queue functions
export const addExecutionJob = (data: any) => {
  return executionQueue.add('execute_agent', data)
}

export const addWebhookJob = (data: any) => {
  return webhookQueue.add('send_webhook', data)
}

export const addNotificationJob = (data: any) => {
  return notificationQueue.add('send_notification', data)
}

// Export queue stats
export const getQueueStats = async () => {
  const [executionStats, webhookStats, notificationStats] = await Promise.all([
    executionQueue.getJobCounts(),
    webhookQueue.getJobCounts(),
    notificationQueue.getJobCounts()
  ])

  return {
    execution: executionStats,
    webhook: webhookStats,
    notification: notificationStats
  }
}