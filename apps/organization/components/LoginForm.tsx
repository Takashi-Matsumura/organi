'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { FaUser, FaLock, FaEye, FaEyeSlash, FaInfoCircle, FaSpinner, FaCog, FaServer } from 'react-icons/fa'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [ldapSettings, setLdapSettings] = useState({
    url: '',
    baseDN: '',
    bindDN: '',
    bindPassword: ''
  })
  const [testingConnection, setTestingConnection] = useState(false)
  
  const { login, isLoading, error, authStatus } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    const loginData = {
      username,
      password,
      ...(showAdvanced && ldapSettings.url ? { ldapSettings } : {})
    }

    const success = await login(loginData)
    if (success) {
      // ログイン成功時はページをリロードして状態を確実に更新
      setUsername('')
      setPassword('')
      window.location.reload()
    }
  }

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    const success = await login({ username: demoUsername, password: demoPassword })
    if (success) {
      window.location.reload()
    }
  }

  const handleTestConnection = async () => {
    if (!ldapSettings.url || !username || !password) return

    setTestingConnection(true)
    try {
      const response = await fetch('/api/auth/test-ldap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ldapConfig: ldapSettings,
          credentials: { username, password }
        })
      })

      const result = await response.json()
      if (result.success) {
        alert('LDAP接続テストが成功しました！')
      } else {
        alert(`LDAP接続テストが失敗しました: ${result.error}`)
      }
    } catch (error) {
      alert('接続テスト中にエラーが発生しました')
    } finally {
      setTestingConnection(false)
    }
  }

  const getAuthModeDisplay = () => {
    if (!authStatus) return '認証システム'
    
    switch (authStatus.authMode) {
      case 'ldap':
        return authStatus.ldapConfigured 
          ? 'LDAP認証' 
          : 'LDAP認証（設定未完了）'
      case 'bypass':
        return '開発用認証'
      default:
        return '認証システム'
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-full max-w-md">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">ORGANI</h2>
        <p className="text-gray-600">組織管理アプリ</p>
        <div className="mt-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            authStatus?.authMode === 'ldap' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {getAuthModeDisplay()}
          </span>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* ログインフォーム */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名
          </label>
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ユーザー名を入力"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="パスワードを入力"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !username || !password}
          className={`w-full py-2 px-4 rounded font-medium transition-colors flex items-center justify-center gap-2 ${
            isLoading || !username || !password
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" size={16} />
              認証中...
            </>
          ) : (
            'ログイン'
          )}
        </button>
      </form>

      {/* 開発用デモアカウント */}
      {authStatus?.authMode === 'bypass' && authStatus.bypassUsers && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center text-sm text-gray-600">
              <FaInfoCircle className="mr-1" size={12} />
              開発用アカウント
            </div>
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showDemo ? '閉じる' : '表示'}
            </button>
          </div>

          {showDemo && (
            <div className="space-y-2 p-3 bg-blue-50 border border-blue-200 rounded">
              {authStatus.bypassUsers.map((user) => (
                <div key={user.username} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{user.username}</span>
                    <span className="text-gray-500 ml-2">({user.role})</span>
                  </div>
                  <button
                    onClick={() => handleDemoLogin(user.username, `${user.username}123`)}
                    disabled={isLoading}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      isLoading 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    ログイン
                  </button>
                </div>
              ))}
              <div className="text-xs text-gray-500 mt-2">
                ※ パスワードは「ユーザー名 + 123」です
              </div>
            </div>
          )}
        </div>
      )}

      {/* 高度な設定 */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <FaCog className="mr-1" size={12} />
            高度な設定
          </div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? '閉じる' : 'LDAP設定'}
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <FaServer className="mr-2" size={14} />
              LDAPサーバ設定
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                LDAP URL
              </label>
              <input
                type="text"
                value={ldapSettings.url}
                onChange={(e) => setLdapSettings(prev => ({ ...prev, url: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="ldap://ldap.company.com:389"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Base DN
              </label>
              <input
                type="text"
                value={ldapSettings.baseDN}
                onChange={(e) => setLdapSettings(prev => ({ ...prev, baseDN: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="dc=company,dc=com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Bind DN
              </label>
              <input
                type="text"
                value={ldapSettings.bindDN}
                onChange={(e) => setLdapSettings(prev => ({ ...prev, bindDN: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="cn=admin,dc=company,dc=com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Bind Password
              </label>
              <input
                type="password"
                value={ldapSettings.bindPassword}
                onChange={(e) => setLdapSettings(prev => ({ ...prev, bindPassword: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="バインドパスワード"
                disabled={isLoading}
              />
            </div>

            {/* 接続テストボタン */}
            {ldapSettings.url && username && password && (
              <button
                onClick={handleTestConnection}
                disabled={testingConnection}
                className={`w-full py-2 px-3 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  testingConnection
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {testingConnection ? (
                  <>
                    <FaSpinner className="animate-spin" size={14} />
                    テスト中...
                  </>
                ) : (
                  'LDAP接続テスト'
                )}
              </button>
            )}

            <div className="text-xs text-gray-500">
              ※ 設定したLDAPサーバで認証をテストできます
            </div>
          </div>
        )}
      </div>

      {/* LDAP認証時の注意 */}
      {authStatus?.authMode === 'ldap' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            社内LDAPアカウントでログインしてください
          </p>
        </div>
      )}
    </div>
  )
}