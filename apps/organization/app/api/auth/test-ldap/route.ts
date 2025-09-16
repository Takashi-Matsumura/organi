import { NextRequest, NextResponse } from 'next/server'
import { LDAPService } from '../../../lib/ldap'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ldapConfig, credentials } = body

    if (!ldapConfig || !credentials) {
      return NextResponse.json(
        { success: false, error: 'LDAP設定と認証情報が必要です' },
        { status: 400 }
      )
    }

    // LDAP設定の検証
    if (!ldapConfig.url || !ldapConfig.baseDN || !ldapConfig.bindDN || !ldapConfig.bindPassword) {
      return NextResponse.json(
        { success: false, error: 'LDAP設定に不足している項目があります' },
        { status: 400 }
      )
    }

    // LDAPサービスインスタンスを作成してテスト
    const ldapService = new LDAPService(ldapConfig)
    const user = await ldapService.authenticate(credentials)

    if (user) {
      return NextResponse.json({
        success: true,
        message: 'LDAP認証テストが成功しました',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          department: user.department,
          section: user.section
        }
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'LDAP認証に失敗しました（ユーザー名またはパスワードが間違っています）' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('LDAP test error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'LDAP接続エラーが発生しました'
      },
      { status: 500 }
    )
  }
}