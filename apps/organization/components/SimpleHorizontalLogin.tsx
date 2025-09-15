'use client'

import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaCog, 
  FaServer, FaNetworkWired, FaChevronDown, FaChevronUp 
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

export function SimpleHorizontalLogin() {
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
  
  const { login, isLoading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    
    const success = await login({
      username,
      password,
      ldapSettings: showAdvanced ? ldapSettings : undefined,
      proxySettings: showAdvanced && proxySettings.enabled ? proxySettings : undefined
    })
    
    // ログイン成功時はページをリロードして確実に認証状態を反映
    if (success && typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* 左側 - ブランディングエリア */}
          <div className="w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex flex-col justify-center items-center p-12 text-white">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-8 shadow-lg">
                <FaUser className="text-white text-3xl" />
              </div>
              <h1 className="text-5xl font-bold mb-4">ORGANI</h1>
              <p className="text-xl mb-8 opacity-90">組織管理アプリ</p>
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>社員情報の統合管理</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>評価者・被評価者の管理</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>セキュアなアクセス制御</span>
                </div>
              </div>
            </div>
          </div>

          {/* 右側 - ログインフォーム */}
          <div className="w-1/2 p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">ログイン</h2>
              <p className="text-gray-600 mb-8">認証情報を入力してください</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ユーザー名
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ユーザー名を入力"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    パスワード
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="パスワードを入力"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      認証中...
                    </>
                  ) : (
                    'ログイン'
                  )}
                </button>
              </form>

              {/* 高度な設定 */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <FaCog className="mr-2" />
                  高度な設定
                  {showAdvanced ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                    {/* LDAP設定 */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                        <FaServer className="mr-2" />
                        LDAP設定
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">LDAP URL</label>
                          <input
                            type="text"
                            value={ldapSettings.url}
                            onChange={(e) => setLdapSettings({...ldapSettings, url: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ldap://192.168.1.100:389"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Base DN</label>
                          <input
                            type="text"
                            value={ldapSettings.baseDN}
                            onChange={(e) => setLdapSettings({...ldapSettings, baseDN: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="dc=company,dc=com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Bind DN</label>
                          <input
                            type="text"
                            value={ldapSettings.bindDN}
                            onChange={(e) => setLdapSettings({...ldapSettings, bindDN: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="cn=service,dc=company,dc=com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Bind パスワード</label>
                          <input
                            type="password"
                            value={ldapSettings.bindPassword}
                            onChange={(e) => setLdapSettings({...ldapSettings, bindPassword: e.target.value})}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* プロキシ設定 */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                        <FaNetworkWired className="mr-2" />
                        プロキシ設定
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={proxySettings.enabled}
                            onChange={(e) => setProxySettings({...proxySettings, enabled: e.target.checked})}
                            className="mr-2"
                          />
                          <span className="text-sm">プロキシを使用する</span>
                        </label>
                        
                        {proxySettings.enabled && (
                          <div className="space-y-2 pl-6">
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">ホスト</label>
                                <input
                                  type="text"
                                  value={proxySettings.host}
                                  onChange={(e) => setProxySettings({...proxySettings, host: e.target.value})}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="proxy.company.com"
                                />
                              </div>
                              <div className="w-24">
                                <label className="block text-xs font-medium text-gray-600 mb-1">ポート</label>
                                <input
                                  type="text"
                                  value={proxySettings.port}
                                  onChange={(e) => setProxySettings({...proxySettings, port: e.target.value})}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="8080"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">ユーザー名</label>
                                <input
                                  type="text"
                                  value={proxySettings.username}
                                  onChange={(e) => setProxySettings({...proxySettings, username: e.target.value})}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-600 mb-1">パスワード</label>
                                <input
                                  type="password"
                                  value={proxySettings.password}
                                  onChange={(e) => setProxySettings({...proxySettings, password: e.target.value})}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 開発用アカウント */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowDemo(!showDemo)}
                  className="flex items-center text-sm text-green-600 hover:text-green-800"
                >
                  開発用認証
                  {showDemo ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
                </button>
                
                {showDemo && (
                  <div className="mt-2 text-xs text-gray-500 bg-green-50 p-3 rounded">
                    <div>admin/admin123 (管理者権限)</div>
                    <div>editor/editor123 (編集者権限)</div>
                    <div>viewer/viewer123 (閲覧者権限)</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}