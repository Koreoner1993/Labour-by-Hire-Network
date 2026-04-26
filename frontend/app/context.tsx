'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { api, getToken, setToken, clearToken } from '@/lib/api'
import { ENDPOINTS } from '@/lib/constants'
import {
  Worker,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  AuthContextType,
} from '@/app/types'

interface AuthState {
  token: string | null
  currentWorker: Worker | null
  isLoading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; worker: Worker } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_WORKER'; payload: Worker }
  | { type: 'INIT_TOKEN'; payload: string | null }

const initialState: AuthState = {
  token: null,
  currentWorker: null,
  isLoading: false,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        currentWorker: action.payload.worker,
        error: null,
      }
    case 'LOGOUT':
      return initialState
    case 'UPDATE_WORKER':
      return {
        ...state,
        currentWorker: action.payload,
      }
    case 'INIT_TOKEN':
      return {
        ...state,
        token: action.payload,
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Initialize token from localStorage on mount
  useEffect(() => {
    const token = getToken()
    if (token) {
      dispatch({ type: 'INIT_TOKEN', payload: token })
      // Optionally fetch profile to validate token
      fetchProfile(token)
    }
  }, [])

  const fetchProfile = useCallback(async (token?: string) => {
    const tokenToUse = token || state.token
    if (!tokenToUse) return

    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const response = await api<Worker>('GET', ENDPOINTS.AUTH_PROFILE)
      dispatch({ type: 'UPDATE_WORKER', payload: response })
      dispatch({ type: 'SET_ERROR', payload: null })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch profile'
      dispatch({ type: 'SET_ERROR', payload: message })
      // If token is invalid, clear it
      if (message.includes('Unauthorized')) {
        logout()
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.token])

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const response = await api<LoginResponse>('POST', ENDPOINTS.AUTH_LOGIN, {
        email,
        password,
      })

      setToken(response.token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token: response.token, worker: response.worker },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    dispatch({ type: 'LOGOUT' })
  }, [])

  const register = useCallback(async (data: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const response = await api<RegisterResponse>('POST', ENDPOINTS.AUTH_REGISTER, data)

      setToken(response.token)
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token: response.token, worker: response.worker },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<Worker>) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })

    try {
      const response = await api<Worker>('PUT', ENDPOINTS.AUTH_PROFILE, data)
      dispatch({ type: 'UPDATE_WORKER', payload: response })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile'
      dispatch({ type: 'SET_ERROR', payload: message })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const value: AuthContextType = {
    token: state.token,
    currentWorker: state.currentWorker,
    isLoading: state.isLoading,
    error: state.error,
    login,
    logout,
    register,
    updateProfile,
    fetchProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
