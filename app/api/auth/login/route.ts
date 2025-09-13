import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, ldapSettings, proxySettings } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'ユーザー名とパスワードが必要です' },
        { status: 400 }
      )
    }

    // 一時的に設定をプロセス環境変数に設定（リクエスト毎）
    if (ldapSettings) {
      process.env.TEMP_LDAP_URL = ldapSettings.url
      process.env.TEMP_LDAP_BASE_DN = ldapSettings.baseDN
      process.env.TEMP_LDAP_BIND_DN = ldapSettings.bindDN
      process.env.TEMP_LDAP_BIND_PASSWORD = ldapSettings.bindPassword
    }

    if (proxySettings?.enabled) {
      process.env.TEMP_HTTP_PROXY = `http://${proxySettings.username ? `${proxySettings.username}:${proxySettings.password}@` : ''}${proxySettings.host}:${proxySettings.port}`
      process.env.TEMP_HTTPS_PROXY = process.env.TEMP_HTTP_PROXY
    }

    const authService = new AuthService()
    const result = await authService.authenticate({ username, password })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '認証に失敗しました' },
        { status: 401 }
      )
    }

    // 成功レスポンス
    return NextResponse.json({
      success: true,
      user: result.user,
      permissions: result.permissions,
      token: result.token,
      refreshToken: result.refreshToken
    })

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}