'use client'

import { useState, useEffect } from 'react'

export type Permission = 'READ' | 'WRITE' | 'DELETE'
export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER' | null

interface AccessTokenConfig {
  token: string
  role: Role
  permissions: Permission[]
  description: string
}

// 固定アクセスToken設定
const ACCESS_TOKENS: AccessTokenConfig[] = [
  {
    token: 'demo-admin-token-2024',
    role: 'ADMIN',
    permissions: ['READ', 'WRITE', 'DELETE'],
    description: '管理者権限 - 全操作可能'
  },
  {
    token: 'demo-editor-token-2024',
    role: 'EDITOR',
    permissions: ['READ', 'WRITE'],
    description: '編集者権限 - 閲覧・編集可能'
  },
  {
    token: 'demo-viewer-token-2024',
    role: 'VIEWER',
    permissions: ['READ'],
    description: '閲覧者権限 - 閲覧のみ'
  }
]

const STORAGE_KEY = 'organi-access-token'

export function useTokenAuth() {
  const [accessToken, setAccessToken] = useState<string>('')
  const [role, setRole] = useState<Role>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [description, setDescription] = useState('')

  // ローカルストレージからアクセスTokenを復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem(STORAGE_KEY)
      if (savedToken) {
        validateAndSetAccessToken(savedToken)
      }
    }
  }, [])

  // アクセスTokenの検証と設定
  const validateAndSetAccessToken = (token: string) => {
    const config = ACCESS_TOKENS.find(config => config.token === token)
    
    if (config) {
      setAccessToken(token)
      setRole(config.role)
      setPermissions(config.permissions)
      setDescription(config.description)
      setIsAuthenticated(true)
      
      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, token)
      }
    } else {
      // 無効なTokenの場合
      setAccessToken('')
      setRole(null)
      setPermissions([])
      setDescription('')
      setIsAuthenticated(false)
      
      // ローカルストレージから削除
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }

  // アクセスTokenの設定
  const setAuthAccessToken = (token: string) => {
    validateAndSetAccessToken(token)
  }

  // ログアウト
  const logout = () => {
    setAccessToken('')
    setRole(null)
    setPermissions([])
    setDescription('')
    setIsAuthenticated(false)
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 権限チェック
  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission)
  }

  // 読み取り権限チェック
  const canRead = (): boolean => {
    return hasPermission('READ')
  }

  // 書き込み権限チェック
  const canWrite = (): boolean => {
    return hasPermission('WRITE')
  }

  // 削除権限チェック
  const canDelete = (): boolean => {
    return hasPermission('DELETE')
  }

  // 利用可能なアクセスToken一覧を取得（デモ用）
  const getAvailableTokens = (): AccessTokenConfig[] => {
    return ACCESS_TOKENS
  }

  return {
    accessToken,
    role,
    permissions,
    isAuthenticated,
    description,
    setAuthAccessToken,
    logout,
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    getAvailableTokens
  }
}