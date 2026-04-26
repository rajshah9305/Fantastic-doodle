"use client"

import { useState, useEffect, useCallback } from 'react'
import { api, User } from '@/lib/api'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null })

  const fetchUser = useCallback(async () => {
    const token = api.getToken()
    if (!token) {
      setState({ user: null, loading: false, error: null })
      return
    }
    try {
      const user = await api.getMe()
      setState({ user, loading: false, error: null })
    } catch {
      api.setToken(null)
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const { user } = await api.login(email, password)
      setState({ user, loading: false, error: null })
      return user
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      setState(s => ({ ...s, loading: false, error: msg }))
      throw err
    }
  }

  const register = async (email: string, password: string, name?: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const { user } = await api.register(email, password, name)
      setState({ user, loading: false, error: null })
      return user
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setState(s => ({ ...s, loading: false, error: msg }))
      throw err
    }
  }

  const logout = async () => {
    await api.logout()
    setState({ user: null, loading: false, error: null })
  }

  return { ...state, login, register, logout, refetch: fetchUser }
}
