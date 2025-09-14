'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCog, 
  FaServer, FaNetworkWired, FaChevronDown, FaChevronUp,
  FaBuilding, FaKey, FaUsers, FaChartLine, FaShieldAlt
} from 'react-icons/fa'

interface LDAPSettings {
  url: string
  baseDN: string
  bindDN: string
  bindPassword: string
}

interface ProxySettings {
  enabled: boolean
  host: string
  port: string
  username: string
  password: string
}

export function HorizontalLoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  
  // LDAP設定
  const [ldapSettings, setLdapSettings] = useState<LDAPSettings>({
    url: 'ldap://192.168.1.100:389',
    baseDN: 'dc=company,dc=com',
    bindDN: 'cn=service,dc=company,dc=com',
    bindPassword: ''
  })

  // プロキシ設定
  const [proxySettings, setProxySettings] = useState<ProxySettings>({
    enabled: false,
    host: '',
    port: '8080',
    username: '',
    password: ''
  })
  
  const { login, isLoading, error, authStatus } = useAuth()

  // 設定をlocalStorageから復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLdap = localStorage.getItem('ldap-settings')
      const savedProxy = localStorage.getItem('proxy-settings')
      
      if (savedLdap) {
        try {
          setLdapSettings(JSON.parse(savedLdap))
        } catch (e) {
          console.error('LDAP設定の復元に失敗:', e)
        }
      }
      
      if (savedProxy) {
        try {
          setProxySettings(JSON.parse(savedProxy))
        } catch (e) {
          console.error('プロキシ設定の復元に失敗:', e)
        }
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return

    // 設定をlocalStorageに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('ldap-settings', JSON.stringify(ldapSettings))
      localStorage.setItem('proxy-settings', JSON.stringify(proxySettings))
    }
    
    // LDAP認証の場合は設定も含めてログイン
    if (authStatus?.authMode === 'ldap') {
      const success = await loginWithSettings(username, password, ldapSettings, proxySettings)
      if (success) {
        window.location.reload()
      }
    } else {
      const success = await login({ username, password })
      if (success) {
        window.location.reload()
      }
    }
  }

  // 設定付きログイン関数
  const loginWithSettings = async (username: string, password: string, ldapSettings: LDAPSettings, proxySettings: ProxySettings): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username, 
          password, 
          ldapSettings,
          proxySettings
        })
      })

      const result = await response.json()
      return response.ok
    } catch (error) {
      console.error('Login with settings failed:', error)
      return false
    }
  }

  const handleDemoLogin = async (demoUsername: string, demoPassword: string) => {
    const success = await login({ username: demoUsername, password: demoPassword })
    if (success) {
      window.location.reload()
    }
  }

  const getAuthModeDisplay = () => {
    if (!authStatus) return { text: '認証システム', color: 'bg-gray-100 text-gray-800', icon: FaShieldAlt }
    
    switch (authStatus.authMode) {
      case 'ldap':
        return authStatus.ldapConfigured 
          ? { text: 'LDAP認証', color: 'bg-blue-100 text-blue-800', icon: FaServer }
          : { text: 'LDAP認証（設定要）', color: 'bg-yellow-100 text-yellow-800', icon: FaServer }
      case 'bypass':
        return { text: '開発用認証', color: 'bg-green-100 text-green-800', icon: FaCog }
      default:
        return { text: '認証システム', color: 'bg-gray-100 text-gray-800', icon: FaShieldAlt }
    }
  }

  const authMode = getAuthModeDisplay()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* 左側：ブランディングエリア */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* 背景装飾 */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 text-center max-w-lg px-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-8 shadow-2xl">
              <FaBuilding className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              ORGANI
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              組織管理アプリケーション
            </p>
            
            <div className="grid grid-cols-1 gap-4 text-left">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUsers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">人事評価管理</h3>
                  <p className="text-sm text-gray-500">評価者と被評価者の関係を効率的に管理</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <FaChartLine className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold">組織構造の可視化</h3>
                  <p className="text-sm text-gray-500">直感的な組織図で構造を把握</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FaShieldAlt className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">セキュアな認証</h3>
                  <p className="text-sm text-gray-500">LDAP連携による安全なアクセス制御</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：ログインエリア */}
        <div className="w-[480px] bg-white shadow-2xl flex flex-col justify-center px-12 py-8">
          {/* ヘッダー */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ログイン</h2>
            <p className="text-gray-600">認証情報を入力してください</p>
            
            <div className="mt-4">
              <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${authMode.color}`}>
                <authMode.icon className="w-4 h-4 mr-2" />
                {authMode.text}
              </span>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ログインフォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ユーザー名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="ユーザー名を入力"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  placeholder="パスワードを入力"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-3 ${
                isLoading || !username || !password
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin h-5 w-5" />
                  認証中...
                </>
              ) : (
                <>
                  <FaKey className="h-5 w-5" />
                  ログイン
                </>
              )}
            </button>
          </form>

          {/* 設定セクション */}
          <div className="mt-8 space-y-4">
            {/* 高度な設定 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-4 py-3 text-left flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FaCog className="h-4 w-4" />
                  <span className="font-medium">高度な設定</span>
                </div>
                {showAdvanced ? <FaChevronUp className="h-4 w-4" /> : <FaChevronDown className="h-4 w-4" />}
              </button>
              
              {showAdvanced && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                  <div className="space-y-4 pt-4">
                    {/* LDAP設定 */}
                    {authStatus?.authMode === 'ldap' && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FaServer className="h-4 w-4" />
                          LDAP設定
                        </h4>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={ldapSettings.url}
                            onChange={(e) => setLdapSettings({...ldapSettings, url: e.target.value})}
                            placeholder="LDAP URL (例: ldap://192.168.1.100:389)"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={ldapSettings.baseDN}
                            onChange={(e) => setLdapSettings({...ldapSettings, baseDN: e.target.value})}
                            placeholder="Base DN (例: dc=company,dc=com)"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            value={ldapSettings.bindDN}
                            onChange={(e) => setLdapSettings({...ldapSettings, bindDN: e.target.value})}
                            placeholder="Bind DN (例: cn=service,dc=company,dc=com)"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="password"
                            value={ldapSettings.bindPassword}
                            onChange={(e) => setLdapSettings({...ldapSettings, bindPassword: e.target.value})}
                            placeholder="Bind Password"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* プロキシ設定 */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaNetworkWired className="h-4 w-4" />
                        プロキシ設定
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="proxy-enabled"
                            checked={proxySettings.enabled}
                            onChange={(e) => setProxySettings({...proxySettings, enabled: e.target.checked})}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="proxy-enabled" className="ml-2 text-sm text-gray-700">
                            プロキシを使用する
                          </label>
                        </div>
                        
                        {proxySettings.enabled && (
                          <>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={proxySettings.host}
                                onChange={(e) => setProxySettings({...proxySettings, host: e.target.value})}
                                placeholder="プロキシホスト"
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                value={proxySettings.port}
                                onChange={(e) => setProxySettings({...proxySettings, port: e.target.value})}
                                placeholder="ポート"
                                className="w-20 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={proxySettings.username}
                                onChange={(e) => setProxySettings({...proxySettings, username: e.target.value})}
                                placeholder="プロキシユーザー名（任意）"
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="password"
                                value={proxySettings.password}
                                onChange={(e) => setProxySettings({...proxySettings, password: e.target.value})}
                                placeholder="パスワード（任意）"
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 開発用アカウント */}
            {authStatus?.authMode === 'bypass' && authStatus.bypassUsers && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowDemo(!showDemo)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FaKey className="h-4 w-4" />
                    <span className="font-medium">開発用アカウント</span>
                  </div>
                  {showDemo ? <FaChevronUp className="h-4 w-4" /> : <FaChevronDown className="h-4 w-4" />}
                </button>
                
                {showDemo && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="space-y-2 pt-4">
                      {authStatus.bypassUsers.map((user) => (
                        <div key={user.username} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                          <div>
                            <div className="font-medium text-gray-800 text-sm">{user.username}</div>
                            <div className="text-xs text-gray-600">{user.description}</div>
                          </div>
                          <button
                            onClick={() => handleDemoLogin(user.username, `${user.username}123`)}
                            disabled={isLoading}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              isLoading 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            ログイン
                          </button>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 text-center pt-2">
                        ※ パスワードは「ユーザー名 + 123」です
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}