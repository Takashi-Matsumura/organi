'use client'

import { useState } from 'react'
import { FaCheck, FaTimes, FaSpinner, FaKey, FaUser } from 'react-icons/fa'

interface AuthorizationInfo {
  userId: string
  username: string
  employeeId: string
  permissions: {
    canRead: boolean
    canWrite: boolean
    canDelete: boolean
    isManager: boolean
  }
  department: string
  position: string
  authorizedAt: string
  tokenValid: boolean
}

interface AuthorizationResponse {
  success: boolean
  authorization?: AuthorizationInfo
  error?: string
  tokenValid?: boolean
}

export function AuthorizationTestPanel() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuthorizationResponse | null>(null)
  const [customToken, setCustomToken] = useState('')
  const [useCustomToken, setUseCustomToken] = useState(false)

  const testAuthorization = async () => {
    setLoading(true)
    setResult(null)

    try {
      let token = ''
      
      if (useCustomToken) {
        token = customToken
      } else {
        // 現在のログインユーザーのトークンを取得
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken') || ''
        }
      }

      if (!token) {
        setResult({
          success: false,
          error: '認証トークンが見つかりません。ログインが必要です。'
        })
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Authorization test error:', error)
      setResult({
        success: false,
        error: 'ネットワークエラーまたはサーバーエラーが発生しました'
      })
    } finally {
      setLoading(false)
    }
  }

  const testWithBearerToken = async () => {
    setLoading(true)
    setResult(null)

    try {
      let token = ''
      
      if (useCustomToken) {
        token = customToken
      } else {
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken') || ''
        }
      }

      if (!token) {
        setResult({
          success: false,
          error: '認証トークンが見つかりません。ログインが必要です。'
        })
        setLoading(false)
        return
      }

      const response = await fetch('/api/auth/authorize', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Authorization test error:', error)
      setResult({
        success: false,
        error: 'ネットワークエラーまたはサーバーエラーが発生しました'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <FaKey className="mr-2 text-blue-600" />
        認可API テスト画面
      </h2>
      
      <div className="space-y-6">
        {/* トークン設定セクション */}
        <div className="border border-gray-200 rounded p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">トークン設定</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="use-current"
                checked={!useCustomToken}
                onChange={() => setUseCustomToken(false)}
                className="text-blue-600"
              />
              <label htmlFor="use-current" className="text-sm text-gray-700">
                現在のログインユーザーのトークンを使用
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="use-custom"
                checked={useCustomToken}
                onChange={() => setUseCustomToken(true)}
                className="text-blue-600"
              />
              <label htmlFor="use-custom" className="text-sm text-gray-700">
                カスタムトークンを使用
              </label>
            </div>
            
            {useCustomToken && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  JWTトークンを入力:
                </label>
                <textarea
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  rows={3}
                />
              </div>
            )}
          </div>
        </div>

        {/* テストボタン */}
        <div className="flex space-x-4">
          <button
            onClick={testAuthorization}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaCheck className="mr-2" />
            )}
            POST で認可テスト
          </button>
          
          <button
            onClick={testWithBearerToken}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaCheck className="mr-2" />
            )}
            GET (Bearer) で認可テスト
          </button>
        </div>

        {/* 結果表示 */}
        {result && (
          <div className={`border rounded-lg p-4 ${result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              {result.success ? (
                <>
                  <FaCheck className="text-green-600 mr-2" />
                  <span className="text-green-800">認可成功</span>
                </>
              ) : (
                <>
                  <FaTimes className="text-red-600 mr-2" />
                  <span className="text-red-800">認可失敗</span>
                </>
              )}
            </h3>
            
            {result.success && result.authorization ? (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <FaUser className="mr-1" />
                      ユーザー情報
                    </h4>
                    <div className="space-y-1 text-gray-600">
                      <p><strong>ユーザーID:</strong> {result.authorization.userId}</p>
                      <p><strong>ユーザー名:</strong> {result.authorization.username}</p>
                      <p><strong>社員ID:</strong> {result.authorization.employeeId}</p>
                      <p><strong>部門:</strong> {result.authorization.department}</p>
                      <p><strong>役職:</strong> {result.authorization.position}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">権限情報</h4>
                    <div className="space-y-1 text-gray-600">
                      <p className="flex items-center">
                        <strong>読み取り:</strong>
                        {result.authorization.permissions.canRead ? (
                          <FaCheck className="text-green-500 ml-2" />
                        ) : (
                          <FaTimes className="text-red-500 ml-2" />
                        )}
                      </p>
                      <p className="flex items-center">
                        <strong>書き込み:</strong>
                        {result.authorization.permissions.canWrite ? (
                          <FaCheck className="text-green-500 ml-2" />
                        ) : (
                          <FaTimes className="text-red-500 ml-2" />
                        )}
                      </p>
                      <p className="flex items-center">
                        <strong>削除:</strong>
                        {result.authorization.permissions.canDelete ? (
                          <FaCheck className="text-green-500 ml-2" />
                        ) : (
                          <FaTimes className="text-red-500 ml-2" />
                        )}
                      </p>
                      <p className="flex items-center">
                        <strong>管理者:</strong>
                        {result.authorization.permissions.isManager ? (
                          <FaCheck className="text-green-500 ml-2" />
                        ) : (
                          <FaTimes className="text-red-500 ml-2" />
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong>認可取得時刻:</strong> {new Date(result.authorization.authorizedAt).toLocaleString('ja-JP')}
                  </p>
                  <p className="text-xs text-gray-500">
                    <strong>トークン状態:</strong> {result.authorization.tokenValid ? '有効' : '無効'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-red-600">
                <p><strong>エラー:</strong> {result.error}</p>
                {result.tokenValid === false && (
                  <p className="text-sm mt-2">トークンが無効です。再ログインしてください。</p>
                )}
              </div>
            )}
            
            {/* Raw JSONレスポンス */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Raw APIレスポンスを表示
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}