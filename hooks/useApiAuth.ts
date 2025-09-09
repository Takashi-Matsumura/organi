'use client'

import { useState, useEffect } from 'react'

export type Permission = 'READ' | 'WRITE' | 'DELETE'
export type Role = 'ADMIN' | 'EDITOR' | 'VIEWER' | null

interface ApiKeyConfig {
  key: string
  role: Role
  permissions: Permission[]
  description: string
}

// 固定APIキー設定
const API_KEYS: ApiKeyConfig[] = [
  {
    key: 'demo-admin-key-2024',
    role: 'ADMIN',
    permissions: ['READ', 'WRITE', 'DELETE'],
    description: '管理者権限 - 全操作可能'
  },
  {
    key: 'demo-editor-key-2024',
    role: 'EDITOR',
    permissions: ['READ', 'WRITE'],
    description: '編集者権限 - 閲覧・編集可能'
  },
  {
    key: 'demo-viewer-key-2024',
    role: 'VIEWER',
    permissions: ['READ'],
    description: '閲覧者権限 - 閲覧のみ'
  }
]

const STORAGE_KEY = 'organi-api-key'

export function useApiAuth() {
  const [apiKey, setApiKey] = useState<string>('')
  const [role, setRole] = useState<Role>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [description, setDescription] = useState('')

  // ローカルストレージからAPIキーを復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(STORAGE_KEY)
      if (savedKey) {
        validateAndSetApiKey(savedKey)
      }
    }
  }, [])

  // APIキーの検証と設定
  const validateAndSetApiKey = (key: string) => {
    const config = API_KEYS.find(config => config.key === key)
    
    if (config) {
      setApiKey(key)
      setRole(config.role)
      setPermissions(config.permissions)
      setDescription(config.description)
      setIsAuthenticated(true)
      
      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, key)
      }
    } else {
      // 無効なキーの場合
      setApiKey('')
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

  // APIキーの設定
  const setAuthApiKey = (key: string) => {
    validateAndSetApiKey(key)
  }

  // ログアウト
  const logout = () => {
    setApiKey('')
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

  // 利用可能なAPIキー一覧を取得（デモ用）
  const getAvailableKeys = (): ApiKeyConfig[] => {
    return API_KEYS
  }

  return {
    apiKey,
    role,
    permissions,
    isAuthenticated,
    description,
    setAuthApiKey,
    logout,
    hasPermission,
    canRead,
    canWrite,
    canDelete,
    getAvailableKeys
  }
}