'use client'

import { useState } from 'react'
import { useApiAuth } from '../hooks/useApiAuth'
import { FaKey, FaEye, FaEyeSlash, FaSignOutAlt, FaInfoCircle } from 'react-icons/fa'

export function ApiKeyInput() {
  const [showKey, setShowKey] = useState(false)
  const [inputKey, setInputKey] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  
  const { 
    apiKey, 
    role, 
    isAuthenticated, 
    description,
    setAuthApiKey, 
    logout,
    getAvailableKeys
  } = useApiAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setAuthApiKey(inputKey)
    setInputKey('')
    // APIキー設定後にページをリロードしてログイン効果を演出
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  const handleDemoKeySelect = (key: string) => {
    setIsLoggingIn(true)
    setAuthApiKey(key)
    setShowDemo(false)
    // デモキー選択後にページをリロードしてログイン効果を演出
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  const getRoleColor = () => {
    switch (role) {
      case 'ADMIN': return 'text-red-600'
      case 'EDITOR': return 'text-yellow-600'
      case 'VIEWER': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getRoleBgColor = () => {
    switch (role) {
      case 'ADMIN': return 'bg-red-50 border-red-200'
      case 'EDITOR': return 'bg-yellow-50 border-yellow-200'
      case 'VIEWER': return 'bg-green-50 border-green-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaKey className="text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">APIキー認証</h3>
          </div>
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <FaInfoCircle className="mr-1" size={12} />
            デモキー
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="APIキーを入力してください..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoggingIn}
            className={`px-4 py-2 text-white rounded transition-colors flex items-center gap-2 ${
              isLoggingIn 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoggingIn ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                ログイン中...
              </>
            ) : (
              '認証'
            )}
          </button>
        </form>

        {showDemo && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="text-sm font-medium text-blue-800 mb-2">デモ用APIキー</h4>
            <div className="space-y-2">
              {getAvailableKeys().map((config) => (
                <div key={config.key} className="flex items-center justify-between text-xs">
                  <div>
                    <span className={`font-mono ${getRoleColor()}`}>{config.role}</span>
                    <span className="text-gray-600 ml-2">{config.description}</span>
                  </div>
                  <button
                    onClick={() => handleDemoKeySelect(config.key)}
                    disabled={isLoggingIn}
                    className={`px-2 py-1 rounded transition-colors ${
                      isLoggingIn 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {isLoggingIn ? 'ログイン中...' : '使用'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            ⚠️ このアプリを使用するには有効なAPIキーが必要です。
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center px-3 py-1 rounded text-sm ${getRoleBgColor()}`}>
        <FaKey className={`mr-1 ${getRoleColor()}`} size={12} />
        <span className={`font-medium ${getRoleColor()}`}>
          {role}
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