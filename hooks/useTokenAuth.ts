'use client'

// 後方互換性のため、新しいuseAuthフックにリダイレクトします
import { useAuth } from './useAuth'

export type Permission = 'READ' | 'WRITE' | 'DELETE'
export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER' | null

interface AccessTokenConfig {
  token: string
  role: Role
  permissions: Permission[]
  description: string
}

// 後方互換性のためのラッパー関数
export function useTokenAuth() {
  const auth = useAuth()

  // デバッグログ
  console.log('useTokenAuth state:', {
    isAuthenticated: auth.isAuthenticated,
    role: auth.role,
    userPermissions: auth.userPermissions
  })

  return {
    accessToken: auth.accessToken,
    role: auth.role,
    permissions: auth.permissions,
    isAuthenticated: auth.isAuthenticated,
    description: auth.description,
    setAuthAccessToken: auth.setAuthAccessToken,
    logout: auth.logout,
    hasPermission: auth.hasPermission,
    canRead: auth.canRead,
    canWrite: auth.canWrite,
    canDelete: auth.canDelete,
    getAvailableTokens: auth.getAvailableTokens
  }
}