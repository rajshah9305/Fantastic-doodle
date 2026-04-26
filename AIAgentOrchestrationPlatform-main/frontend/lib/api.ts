const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('auth_token', token)
      else localStorage.removeItem('auth_token')
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return this.token
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || `Request failed: ${res.status}`)
    }

    return res.json()
  }

  // Auth
  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    this.setToken(data.token)
    return data
  }

  async register(email: string, password: string, name?: string) {
    const data = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
    this.setToken(data.token)
    return data
  }

  async getMe() {
    return this.request<User>('/api/auth/me')
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' }).catch(() => {})
    this.setToken(null)
  }

  // Dashboard
  async getDashboard(timeframe = '7d') {
    return this.request<DashboardData>(`/api/dashboard?timeframe=${timeframe}`)
  }

  async getDashboardTrends(timeframe = '7d') {
    return this.request<{ trends: TrendData[]; timeframe: string }>(`/api/dashboard/trends?timeframe=${timeframe}`)
  }

  async getDashboardFrameworks(timeframe = '7d') {
    return this.request<{ frameworks: Record<string, number>; timeframe: string }>(`/api/dashboard/frameworks?timeframe=${timeframe}`)
  }

  // Agents
  async getAgents(params?: { framework?: string; status?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams(params as any).toString()
    return this.request<AgentsResponse>(`/api/agents${q ? `?${q}` : ''}`)
  }

  async getAgent(id: string) {
    return this.request<Agent>(`/api/agents/${id}`)
  }

  async createAgent(data: CreateAgentInput) {
    return this.request<Agent>('/api/agents', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateAgent(id: string, data: Partial<CreateAgentInput>) {
    return this.request<Agent>(`/api/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async deleteAgent(id: string) {
    return this.request<{ message: string }>(`/api/agents/${id}`, { method: 'DELETE' })
  }

  // Executions
  async getExecutions(params?: { agentId?: string; status?: string; page?: number; limit?: number }) {
    const q = new URLSearchParams(params as any).toString()
    return this.request<ExecutionsResponse>(`/api/executions${q ? `?${q}` : ''}`)
  }

  async getExecution(id: string) {
    return this.request<Execution>(`/api/executions/${id}`)
  }

  async startExecution(data: StartExecutionInput) {
    return this.request<{ executionId: string; status: string }>('/api/executions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async cancelExecution(id: string) {
    return this.request<{ message: string }>(`/api/executions/${id}`, { method: 'DELETE' })
  }

  async getExecutionLogs(id: string, params?: { level?: string; limit?: number; offset?: number }) {
    const q = new URLSearchParams(params as any).toString()
    return this.request<{ logs: ExecutionLog[]; pagination: Pagination }>(`/api/executions/${id}/logs${q ? `?${q}` : ''}`)
  }

  // API Keys
  async getApiKeys() {
    return this.request<{ keys: ApiKey[] }>('/api/api-keys')
  }

  async createApiKey(data: { name: string; permissions?: string[]; expiresAt?: string }) {
    return this.request<ApiKey & { key: string }>('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteApiKey(id: string) {
    return this.request<{ message: string }>(`/api/api-keys/${id}`, { method: 'DELETE' })
  }

  async revokeApiKey(id: string) {
    return this.request<{ message: string }>(`/api/api-keys/${id}/revoke`, { method: 'PATCH' })
  }

  // Webhooks
  async getWebhooks() {
    return this.request<{ webhooks: Webhook[] }>('/api/webhooks')
  }

  async createWebhook(data: { url: string; events: string[]; secret?: string }) {
    return this.request<{ webhookId: string; message: string }>('/api/webhooks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async deleteWebhook(id: string) {
    return this.request<{ message: string }>(`/api/webhooks/${id}`, { method: 'DELETE' })
  }

  async testWebhook(id: string) {
    return this.request<{ message: string }>(`/api/webhooks/${id}/test`, { method: 'POST' })
  }

  // Cerebras models
  async getCerebrasModels() {
    return this.request<{ provider: string; models: CerebrasModel[] }>('/api/cerebras/models')
  }
}

// Types
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: string
  createdAt: string
}

export interface Agent {
  id: string
  name: string
  description?: string
  framework: string
  configuration: Record<string, unknown>
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'ERROR'
  isActive: boolean
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  avgExecutionTime?: number
  lastExecutedAt?: string
  createdAt: string
  updatedAt: string
  _count?: { executions: number }
}

export interface CreateAgentInput {
  name: string
  framework: string
  description?: string
  configuration: Record<string, unknown>
  tags?: string[]
  isActive?: boolean
}

export interface Execution {
  id: string
  agentId: string
  userId: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  input?: unknown
  output?: unknown
  error?: string
  environment: string
  trigger: string
  startedAt: string
  completedAt?: string
  duration?: number
  tokensUsed?: number
  cost?: number
  progress?: number
  agent?: { id: string; name: string; framework: string }
  logs?: ExecutionLog[]
}

export interface StartExecutionInput {
  agentId: string
  input?: unknown
  configuration?: Record<string, unknown>
  environment?: 'development' | 'staging' | 'production'
  trigger?: 'manual' | 'scheduled' | 'webhook'
}

export interface ExecutionLog {
  id: string
  executionId: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
  message: string
  timestamp: string
  metadata?: unknown
}

export interface ApiKey {
  id: string
  name: string
  permissions: string[]
  isActive: boolean
  lastUsedAt?: string
  expiresAt?: string
  createdAt: string
  key?: string
}

export interface Webhook {
  id: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: string
}

export interface DashboardData {
  metrics: {
    activeAgents: number
    totalExecutions: number
    completedExecutions: number
    failedExecutions: number
    successRate: number
    savedConfigs: number
    avgDuration: number
  }
  recentExecutions: Execution[]
  timeframe: string
}

export interface TrendData {
  date: string
  total: number
  completed: number
  failed: number
  cost: number
}

export interface AgentsResponse {
  agents: Agent[]
  pagination: Pagination
}

export interface ExecutionsResponse {
  executions: Execution[]
  pagination: Pagination
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface CerebrasModel {
  id: string
  name: string
  context_window: number
  max_tokens: number
}

export const api = new ApiClient(API_URL)
