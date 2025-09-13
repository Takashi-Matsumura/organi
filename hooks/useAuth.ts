'use client'

import { useState, useEffect } from 'react'
import { AuthUser, UserPermissions } from '../types/auth'

export type Permission = 'READ' | 'WRITE' | 'DELETE'
export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER' | null

interface AuthState {
  user: AuthUser | null
  permissions: UserPermissions | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthStatus {
  authMode: 'ldap' | 'bypass'
  ldapConfigured: boolean
  bypassUsers?: {
    username: string
    role: string
    description: string
  }[]
}

const STORAGE_KEY = 'organi-auth-token'
const REFRESH_STORAGE_KEY = 'organi-refresh-token'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    permissions: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  // 認証状態の変化をログ出力
  useEffect(() => {
    console.log('useAuth state changed:', authState)
  }, [authState])

  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)

  // 認証状態の初期化
  useEffect(() => {
    const initializeAuth = async () => {
      // 認証設定を取得
      await fetchAuthStatus()
      
      // 保存されたトークンで認証チェック
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem(STORAGE_KEY)
        if (token) {
          await verifyStoredToken(token)
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initializeAuth()
  }, [])

  // 認証設定取得
  const fetchAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status')
      if (response.ok) {
        const status = await response.json()
        setAuthStatus(status)
      }
    } catch (error) {
      console.error('Failed to fetch auth status:', error)
    }
  }

  // 保存されたトークンの検証
  const verifyStoredToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setAuthState({
          user: result.user,
          permissions: result.permissions,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } else {
        // トークンが無効な場合、リフレッシュを試行
        await attemptTokenRefresh()
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      await attemptTokenRefresh()
    }
  }

  // トークンリフレッシュ
  const attemptTokenRefresh = async () => {
    if (typeof window === 'undefined') {
      logout()
      return
    }

    const refreshToken = localStorage.getItem(REFRESH_STORAGE_KEY)
    
    if (!refreshToken) {
      logout()
      return
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const result = await response.json()
        
        // 新しいトークンを保存
        localStorage.setItem(STORAGE_KEY, result.token)
        localStorage.setItem(REFRESH_STORAGE_KEY, result.refreshToken)
        
        setAuthState({
          user: result.user,
          permissions: result.permissions,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      } else {
        logout()
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  // ログイン（LDAP設定とプロキシ設定をサポート）
  const login = async (credentials: {
    username: string
    password: string
    ldapSettings?: {
      url: string
      baseDN: string
      bindDN: string
      bindPassword: string
    }
    proxySettings?: {
      enabled: boolean
      host: string
      port: string
      username: string
      password: string
    }
  }): Promise<boolean> => {
    console.log('Login attempt:', { 
      username: credentials.username, 
      hasLdapSettings: !!credentials.ldapSettings,
      hasProxySettings: !!credentials.proxySettings 
    })
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      })

      const result = await response.json()
      console.log('Login response:', { ok: response.ok, result })

      if (response.ok) {
        // トークンを保存
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, result.token)
          localStorage.setItem(REFRESH_STORAGE_KEY, result.refreshToken)
          console.log('Tokens saved to localStorage')
        }
        
        setAuthState({
          user: result.user,
          permissions: result.permissions,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
        
        console.log('Auth state updated:', { isAuthenticated: true, user: result.user })
        return true
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'ログインに失敗しました'
        }))
        console.log('Login failed:', result.error)
        return false
      }
    } catch (error) {
      console.error('Login failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'ネットワークエラーが発生しました'
      }))
      return false
    }
  }

  // 後方互換性のためのシンプルなログイン関数
  const simpleLogin = async (username: string, password: string): Promise<boolean> => {
    return login({ username, password })
  }

  // ログアウト
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(REFRESH_STORAGE_KEY)
    }
    
    setAuthState({
      user: null,
      permissions: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }

  // 権限チェック
  const hasPermission = (permission: Permission): boolean => {
    if (!authState.permissions) return false
    return authState.permissions.permissions.includes(permission)
  }

  const canRead = (): boolean => hasPermission('READ')
  const canWrite = (): boolean => hasPermission('WRITE')
  const canDelete = (): boolean => hasPermission('DELETE')

  // 後方互換性のための既存プロパティ
  const [currentToken, setCurrentToken] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentToken(localStorage.getItem(STORAGE_KEY) || '')
    }
  }, [authState.isAuthenticated])

  const compatibilityProps = {
    accessToken: currentToken,
    role: authState.permissions?.role || null,
    permissions: authState.permissions?.permissions || [],
    description: authState.permissions?.description || '',
    isAuthenticated: authState.isAuthenticated,
    setAuthAccessToken: (token: string) => {
      // 既存のトークン形式での設定（後方互換性）
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, token)
        setCurrentToken(token)
      }
    },
    getAvailableTokens: () => {
      return authStatus?.bypassUsers?.map(user => ({
        token: `${user.username}-token`,
        role: user.role as Role,
        permissions: user.role === 'ADMIN' ? ['READ', 'WRITE', 'DELETE'] as Permission[] :
                    user.role === 'EDITOR' ? ['READ', 'WRITE'] as Permission[] :
                    ['READ'] as Permission[],
        description: user.description
      })) || []
    }
  }

  return {
    // 新しい認証システムのプロパティ
    user: authState.user,
    userPermissions: authState.permissions,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    authStatus,
    login,
    simpleLogin, // 後方互換性のため
    logout,
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    
    // 後方互換性のためのプロパティ
    ...compatibilityProps
  }
}