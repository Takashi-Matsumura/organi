'use client'

// シンプルな横型レイアウトのログイン画面を使用
import { SimpleHorizontalLogin } from './SimpleHorizontalLogin'
import { useAuth } from '../hooks/useAuth'
import { FaKey, FaSignOutAlt } from 'react-icons/fa'

export function AccessTokenInput() {
  const { isAuthenticated, userPermissions, logout } = useAuth()

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'text-red-600'
      case 'EDITOR': return 'text-yellow-600'
      case 'VIEWER': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getRoleBgColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-50 border-red-200'
      case 'EDITOR': return 'bg-yellow-50 border-yellow-200'
      case 'VIEWER': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (!isAuthenticated) {
    return <SimpleHorizontalLogin />
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center px-3 py-1 rounded text-sm border ${getRoleBgColor(userPermissions?.role || 'VIEWER')}`}>
        <FaKey className={`mr-1 ${getRoleColor(userPermissions?.role || 'VIEWER')}`} size={12} />
        <span className={`font-medium ${getRoleColor(userPermissions?.role || 'VIEWER')}`}>
          {userPermissions?.role || 'VIEWER'}
        </span>
      </div>
      <button
        onClick={logout}
        className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100"
        title="ログアウト"
      >
        <FaSignOutAlt size={16} />
      </button>
    </div>
  )
}