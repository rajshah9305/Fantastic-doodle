import axios, { AxiosInstance } from 'axios'

// Cerebras API base URL
const CEREBRAS_BASE_URL = 'https://api.cerebras.ai/v1'

// All current Cerebras models per docs
export const CEREBRAS_MODELS = {
  // Production models
  LLAMA_3_1_8B: 'llama3.1-8b',
  GPT_OSS_120B: 'gpt-oss-120b',
  // Preview models
  QWEN_3_235B: 'qwen-3-235b-a22b-instruct-2507',
  ZAI_GLM_4_7: 'zai-glm-4.7',
} as const

export type CerebrasModel = typeof CEREBRAS_MODELS[keyof typeof CEREBRAS_MODELS]

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'developer' | 'tool'
  content: string
  name?: string
}

export interface ChatCompletionRequest {
  model: CerebrasModel | string
  messages: ChatMessage[]
  stream?: boolean
  max_completion_tokens?: number
  temperature?: number
  top_p?: number
  stop?: string | string[]
  seed?: number
  reasoning_effort?: 'low' | 'medium' | 'high' | 'none'
  response_format?: { type: 'text' | 'json_object' | 'json_schema'; json_schema?: Record<string, unknown> }
  tools?: CerebrasTool[]
  tool_choice?: 'none' | 'auto' | 'required'
  service_tier?: 'priority' | 'default' | 'auto' | 'flex'
  user?: string
}

export interface CerebrasTool {
  type: 'function'
  function: {
    name: string
    description?: string
    parameters?: Record<string, unknown>
  }
}

export interface ChatCompletionResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string | null
      reasoning_content?: string
      tool_calls?: Array<{
        type: 'function'
        function: { name: string; arguments: string }
      }>
    }
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls'
    logprobs: null
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    prompt_tokens_details?: { cached_tokens: number }
    completion_tokens_details?: { reasoning_tokens?: number }
  }
  time_info?: {
    queue_time: number
    prompt_time: number
    completion_time: number
    total_time: number
    created: number
  }
  system_fingerprint?: string
  service_tier?: string
}

export interface StreamChunk {
  id: string
  object: 'chat.completion.chunk'
  created: number
  model: string
  choices: Array<{
    index: number
    delta: {
      role?: string
      content?: string | null
      reasoning_content?: string
      tool_calls?: Array<{
        index: number
        type?: 'function'
        function?: { name?: string; arguments?: string }
      }>
    }
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | null
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class CerebrasClient {
  private client: AxiosInstance
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.CEREBRAS_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('CEREBRAS_API_KEY is required')
    }

    this.client = axios.create({
      baseURL: CEREBRAS_BASE_URL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 120_000, // 2 minutes
    })
  }

  /**
   * Create a chat completion (non-streaming)
   */
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const { data } = await this.client.post<ChatCompletionResponse>(
      '/chat/completions',
      { ...request, stream: false }
    )
    return data
  }

  /**
   * Create a streaming chat completion — yields parsed chunks
   */
  async *chatStream(request: ChatCompletionRequest): AsyncGenerator<StreamChunk> {
    const response = await this.client.post('/chat/completions', {
      ...request,
      stream: true,
    }, {
      responseType: 'stream',
    })

    const stream: NodeJS.ReadableStream = response.data
    let buffer = ''

    for await (const raw of stream) {
      buffer += raw.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const chunk: StreamChunk = JSON.parse(trimmed.slice(6))
          yield chunk
        } catch {
          // skip malformed chunks
        }
      }
    }
  }

  /**
   * Simple helper — send a prompt and get back the full text response
   */
  async complete(
    prompt: string,
    options: {
      model?: CerebrasModel | string
      systemPrompt?: string
      temperature?: number
      maxTokens?: number
      reasoningEffort?: 'low' | 'medium' | 'high' | 'none'
    } = {}
  ): Promise<{ content: string; tokensUsed: number; cost: number; model: string }> {
    const model = options.model || CEREBRAS_MODELS.LLAMA_3_1_8B
    const messages: ChatMessage[] = []

    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt })
    }
    messages.push({ role: 'user', content: prompt })

    const req: ChatCompletionRequest = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_completion_tokens: options.maxTokens ?? 8192,
      top_p: 1,
    }

    // reasoning_effort only for supported models
    if (options.reasoningEffort && (model === CEREBRAS_MODELS.GPT_OSS_120B || model === CEREBRAS_MODELS.ZAI_GLM_4_7)) {
      req.reasoning_effort = options.reasoningEffort
    }

    const response = await this.chat(req)
    const content = response.choices[0]?.message?.content ?? ''
    const tokensUsed = response.usage.total_tokens

    // Cerebras pricing: ~$0.10 per 1M tokens for llama3.1-8b, $0.60 for larger
    const pricePerMillion = model === CEREBRAS_MODELS.LLAMA_3_1_8B ? 0.10 : 0.60
    const cost = (tokensUsed / 1_000_000) * pricePerMillion

    return { content, tokensUsed, cost, model }
  }

  /**
   * List available models
   */
  async listModels() {
    return [
      { id: CEREBRAS_MODELS.LLAMA_3_1_8B, name: 'Llama 3.1 8B', parameters: '8B', speed_tps: 2200, tier: 'production' },
      { id: CEREBRAS_MODELS.GPT_OSS_120B, name: 'OpenAI GPT OSS 120B', parameters: '120B', speed_tps: 3000, tier: 'production' },
      { id: CEREBRAS_MODELS.QWEN_3_235B, name: 'Qwen 3 235B Instruct', parameters: '235B', speed_tps: 1400, tier: 'preview' },
      { id: CEREBRAS_MODELS.ZAI_GLM_4_7, name: 'Z.ai GLM 4.7', parameters: '355B', speed_tps: 1000, tier: 'preview' },
    ]
  }
}

// Singleton — lazily initialised so missing key only throws at call time
let _client: CerebrasClient | null = null

export function getCerebrasClient(): CerebrasClient {
  if (!_client) {
    _client = new CerebrasClient()
  }
  return _client
}
