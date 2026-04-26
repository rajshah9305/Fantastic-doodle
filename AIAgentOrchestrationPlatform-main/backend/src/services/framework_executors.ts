import { getCerebrasClient, CEREBRAS_MODELS, ChatMessage } from './cerebras_client'

// ─── Shared interfaces ────────────────────────────────────────────────────────

export interface ExecutionLog {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  message: string
  timestamp: Date
  metadata?: any
}

export interface AgentFramework {
  execute(context: FrameworkExecutionContext): Promise<FrameworkExecutionResult>
  validate(configuration: any): Promise<ValidationResult>
  getSchema(): ConfigurationSchema
}

export interface FrameworkExecutionContext {
  agentId: string
  userId: string
  input: any
  configuration: any
  environment: string
  onLog: (log: ExecutionLog) => void
  onProgress: (progress: number) => void
}

export interface FrameworkExecutionResult {
  success: boolean
  output?: any
  error?: string
  tokensUsed?: number
  cost?: number
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export interface ConfigurationSchema {
  type: 'object'
  properties: Record<string, any>
  required: string[]
}

// ─── Pricing helper ───────────────────────────────────────────────────────────

function calcCost(tokens: number, model: string): number {
  // Production: llama3.1-8b $0.10/1M, gpt-oss-120b $0.60/1M
  // Preview models: $0.60/1M (conservative estimate)
  const rate = model === CEREBRAS_MODELS.LLAMA_3_1_8B ? 0.10 : 0.60
  return (tokens / 1_000_000) * rate
}

function userText(input: any): string {
  if (typeof input === 'string') return input
  if (input && typeof input === 'object' && 'prompt' in input) return String(input.prompt)
  return JSON.stringify(input)
}

// ─── 1. Cerebras Direct ───────────────────────────────────────────────────────
// Single or multi-turn chat against any Cerebras model.
// Supports all 4 models, reasoning_effort for gpt-oss-120b / zai-glm-4.7,
// structured JSON output, tool definitions, and conversation history.

export class CerebrasExecutor implements AgentFramework {
  async execute(ctx: FrameworkExecutionContext): Promise<FrameworkExecutionResult> {
    const { input, configuration, onLog, onProgress } = ctx
    try {
      const cerebras = getCerebrasClient()
      const model: string = configuration.model || CEREBRAS_MODELS.LLAMA_3_1_8B
      const systemPrompt: string = configuration.system_prompt || 'You are a helpful AI assistant.'
      const temperature: number = configuration.temperature ?? 0.7
      const maxTokens: number = configuration.max_completion_tokens ?? 8192
      const topP: number = configuration.top_p ?? 1

      onLog({ level: 'INFO', message: `Cerebras direct — model: ${model}`, timestamp: new Date() })
      onProgress(15)

      const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }]

      // Inject prior conversation history if provided
      if (Array.isArray(configuration.history)) {
        for (const h of configuration.history as ChatMessage[]) {
          messages.push(h)
        }
      }
      messages.push({ role: 'user', content: userText(input) })

      const req: Parameters<typeof cerebras.chat>[0] = {
        model,
        messages,
        temperature,
        max_completion_tokens: maxTokens,
        top_p: topP,
      }

      // reasoning_effort — only gpt-oss-120b and zai-glm-4.7 support it
      if (
        configuration.reasoning_effort &&
        (model === CEREBRAS_MODELS.GPT_OSS_120B || model === CEREBRAS_MODELS.ZAI_GLM_4_7)
      ) {
        req.reasoning_effort = configuration.reasoning_effort as 'low' | 'medium' | 'high' | 'none'
      }

      // Structured JSON output
      if (configuration.response_format) {
        req.response_format = configuration.response_format
      }

      // Tool definitions
      if (Array.isArray(configuration.tools) && configuration.tools.length > 0) {
        req.tools = configuration.tools
        req.tool_choice = configuration.tool_choice ?? 'auto'
      }

      onProgress(40)
      const response = await cerebras.chat(req)
      onProgress(90)

      const choice = response.choices[0]
      const content = choice?.message?.content ?? ''
      const reasoningContent = choice?.message?.reasoning_content
      const toolCalls = choice?.message?.tool_calls
      const totalTokens = response.usage.total_tokens
      const cost = calcCost(totalTokens, model)

      onLog({
        level: 'INFO',
        message: `Done — ${totalTokens} tokens | $${cost.toFixed(6)} | finish: ${choice?.finish_reason}`,
        timestamp: new Date(),
      })
      onProgress(100)

      return {
        success: true,
        output: {
          content,
          ...(reasoningContent ? { reasoning: reasoningContent } : {}),
          ...(toolCalls ? { tool_calls: toolCalls } : {}),
          model: response.model,
          finish_reason: choice?.finish_reason,
          usage: response.usage,
          time_info: response.time_info,
        },
        tokensUsed: totalTokens,
        cost,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      ctx.onLog({ level: 'ERROR', message: `Cerebras failed: ${msg}`, timestamp: new Date() })
      return { success: false, error: msg }
    }
  }

  async validate(cfg: any): Promise<ValidationResult> {
    const valid = Object.values(CEREBRAS_MODELS) as string[]
    const errors: string[] = []
    if (cfg.model && !valid.includes(cfg.model)) {
      errors.push(`Unknown model "${cfg.model}". Valid: ${valid.join(', ')}`)
    }
    if (cfg.temperature !== undefined && (cfg.temperature < 0 || cfg.temperature > 2)) {
      errors.push('temperature must be 0–2')
    }
    return { valid: errors.length === 0, errors }
  }

  getSchema(): ConfigurationSchema {
    return {
      type: 'object',
      properties: {
        model: { type: 'string', enum: Object.values(CEREBRAS_MODELS) },
        system_prompt: { type: 'string' },
        temperature: { type: 'number', minimum: 0, maximum: 2 },
        max_completion_tokens: { type: 'number' },
        top_p: { type: 'number', minimum: 0, maximum: 1 },
        reasoning_effort: { type: 'string', enum: ['low', 'medium', 'high', 'none'] },
        response_format: { type: 'object' },
        tools: { type: 'array' },
        tool_choice: { type: 'string' },
        history: { type: 'array' },
      },
      required: [],
    }
  }
}

// ─── 2. AutoGen ───────────────────────────────────────────────────────────────
// Multi-agent conversation: each agent takes turns responding to a shared
// thread. Agents see the full history. Terminates on TERMINATE signal or
// when max_rounds is reached.

export class AutoGenExecutor implements AgentFramework {
  async execute(ctx: FrameworkExecutionContext): Promise<FrameworkExecutionResult> {
    const { input, configuration, onLog, onProgress } = ctx
    try {
      const v = await this.validate(configuration)
      if (!v.valid) throw new Error(v.errors.join('; '))

      const cerebras = getCerebrasClient()
      const model: string = configuration.llm_config?.model || CEREBRAS_MODELS.LLAMA_3_1_8B
      const temperature: number = configuration.llm_config?.temperature ?? 0.7
      const maxTokens: number = configuration.llm_config?.max_tokens ?? 4096
      const maxRounds: number = Math.min(configuration.max_rounds ?? 6, 20)
      const agents: Array<{ name: string; role: string; system_message?: string }> = configuration.agents

      onLog({ level: 'INFO', message: `AutoGen — ${agents.length} agents, ${maxRounds} max rounds, model: ${model}`, timestamp: new Date() })
      onProgress(10)

      const history: ChatMessage[] = [{ role: 'user', content: userText(input) }]
      let totalTokens = 0
      let totalCost = 0
      const turns: Array<{ agent: string; content: string; round: number }> = []

      for (let round = 0; round < maxRounds; round++) {
        const agent = agents[round % agents.length]
        onLog({ level: 'INFO', message: `[Round ${round + 1}/${maxRounds}] ${agent.name} responding`, timestamp: new Date() })

        const sysMsg = agent.system_message ||
          `You are ${agent.name}, a ${agent.role}. Collaborate with other agents to solve the task. ` +
          `When the task is fully complete, end your message with the word TERMINATE.`

        const response = await cerebras.chat({
          model,
          messages: [{ role: 'system', content: sysMsg }, ...history],
          temperature,
          max_completion_tokens: maxTokens,
        })

        const content = response.choices[0]?.message?.content ?? ''
        totalTokens += response.usage.total_tokens
        totalCost += calcCost(response.usage.total_tokens, model)

        history.push({ role: 'assistant', content: `[${agent.name}]: ${content}` })
        turns.push({ agent: agent.name, content, round: round + 1 })

        onLog({ level: 'INFO', message: `${agent.name}: ${content.slice(0, 150)}${content.length > 150 ? '…' : ''}`, timestamp: new Date() })
        onProgress(10 + Math.round(((round + 1) / maxRounds) * 85))

        if (content.toUpperCase().includes('TERMINATE')) {
          onLog({ level: 'INFO', message: 'Agent signalled TERMINATE — conversation complete', timestamp: new Date() })
          break
        }
      }

      onProgress(100)
      onLog({ level: 'INFO', message: `AutoGen complete — ${turns.length} turns, ${totalTokens} tokens`, timestamp: new Date() })

      return {
        success: true,
        output: {
          turns,
          total_rounds: turns.length,
          final_response: turns[turns.length - 1]?.content ?? '',
        },
        tokensUsed: totalTokens,
        cost: totalCost,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      ctx.onLog({ level: 'ERROR', message: `AutoGen failed: ${msg}`, timestamp: new Date() })
      return { success: false, error: msg }
    }
  }

  async validate(cfg: any): Promise<ValidationResult> {
    const errors: string[] = []
    if (!Array.isArray(cfg.agents) || cfg.agents.length < 2) errors.push('agents: need at least 2')
    if (!cfg.llm_config) errors.push('llm_config is required')
    return { valid: errors.length === 0, errors }
  }

  getSchema(): ConfigurationSchema {
    return {
      type: 'object',
      properties: {
        agents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              role: { type: 'string' },
              system_message: { type: 'string' },
            },
          },
        },
        llm_config: {
          type: 'object',
          properties: {
            model: { type: 'string' },
            temperature: { type: 'number' },
            max_tokens: { type: 'number' },
          },
        },
        max_rounds: { type: 'number' },
      },
      required: ['agents', 'llm_config'],
    }
  }
}

// ─── 3. CrewAI ────────────────────────────────────────────────────────────────
// Role-playing agents execute tasks sequentially (or hierarchically).
// Each agent receives the previous task's output as context.

export class CrewAIExecutor implements AgentFramework {
  async execute(ctx: FrameworkExecutionContext): Promise<FrameworkExecutionResult> {
    const { input, configuration, onLog, onProgress } = ctx
    try {
      const v = await this.validate(configuration)
      if (!v.valid) throw new Error(v.errors.join('; '))

      const cerebras = getCerebrasClient()
      const model: string = configuration.model || CEREBRAS_MODELS.LLAMA_3_1_8B
      const temperature: number = configuration.temperature ?? 0.7
      const maxTokens: number = configuration.max_tokens ?? 4096
      const agents: Array<{ role: string; goal: string; backstory: string }> = configuration.agents
      const tasks: Array<{ description: string; agent: string; expected_output?: string }> = configuration.tasks
      const process: string = configuration.process || 'sequential'

      onLog({ level: 'INFO', message: `CrewAI — ${agents.length} agents, ${tasks.length} tasks, process: ${process}, model: ${model}`, timestamp: new Date() })
      onProgress(10)

      const userCtx = userText(input)
      let totalTokens = 0
      let totalCost = 0
      const taskResults: Array<{ task: string; agent: string; output: string }> = []
      let previousOutput = ''

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i]
        const agent = agents.find(a => a.role === task.agent) ?? agents[i % agents.length]

        onLog({ level: 'INFO', message: `Task ${i + 1}/${tasks.length}: "${task.description}" → ${agent.role}`, timestamp: new Date() })

        const systemPrompt =
          `You are ${agent.role}.\n` +
          `Goal: ${agent.goal}\n` +
          `Backstory: ${agent.backstory}\n` +
          (task.expected_output ? `Expected output format: ${task.expected_output}\n` : '') +
          `Be concise and produce only the requested output.`

        const userMsg = previousOutput
          ? `Context from previous task:\n${previousOutput}\n\nYour task: ${task.description}\n\nUser input: ${userCtx}`
          : `Your task: ${task.description}\n\nUser input: ${userCtx}`

        const response = await cerebras.chat({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg },
          ],
          temperature,
          max_completion_tokens: maxTokens,
        })

        const output = response.choices[0]?.message?.content ?? ''
        totalTokens += response.usage.total_tokens
        totalCost += calcCost(response.usage.total_tokens, model)
        previousOutput = output
        taskResults.push({ task: task.description, agent: agent.role, output })

        onLog({ level: 'INFO', message: `${agent.role} done: ${output.slice(0, 100)}…`, timestamp: new Date() })
        onProgress(10 + Math.round(((i + 1) / tasks.length) * 85))
      }

      onProgress(100)
      onLog({ level: 'INFO', message: `CrewAI complete — ${taskResults.length} tasks, ${totalTokens} tokens`, timestamp: new Date() })

      return {
        success: true,
        output: {
          task_results: taskResults,
          final_output: previousOutput,
          total_tasks: taskResults.length,
        },
        tokensUsed: totalTokens,
        cost: totalCost,
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      ctx.onLog({ level: 'ERROR', message: `CrewAI failed: ${msg}`, timestamp: new Date() })
      return { success: false, error: msg }
    }
  }

  async validate(cfg: any): Promise<ValidationResult> {
    const errors: string[] = []
    if (!Array.isArray(cfg.agents) || cfg.agents.length === 0) errors.push('agents array required')
    if (!Array.isArray(cfg.tasks) || cfg.tasks.length === 0) errors.push('tasks array required')
    return { valid: errors.length === 0, errors }
  }

  getSchema(): ConfigurationSchema {
    return {
      type: 'object',
      properties: {
        agents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              role: { type: 'string' },
              goal: { type: 'string' },
              backstory: { type: 'string' },
            },
          },
        },
        tasks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              description: { type: 'string' },
              agent: { type: 'string' },
              expected_output: { type: 'string' },
            },
          },
        },
        process: { type: 'string', enum: ['sequential', 'hierarchical'] },
        model: { type: 'string' },
        temperature: { type: 'number' },
        max_tokens: { type: 'number' },
      },
      required: ['agents', 'tasks'],
    }
  }
}
