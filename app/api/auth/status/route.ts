import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authMode = process.env.AUTH_MODE || 'bypass'
    const ldapUrl = process.env.LDAP_URL || 'not configured'
    
    return NextResponse.json({
      authMode,
      ldapConfigured: authMode === 'ldap' && ldapUrl !== 'not configured',
      bypassUsers: authMode === 'bypass' ? [
        { username: 'admin', role: 'ADMIN', description: '管理者（開発用）' },
        { username: 'editor', role: 'EDITOR', description: '編集者（開発用）' },
        { username: 'viewer', role: 'VIEWER', description: '閲覧者（開発用）' }
      ] : undefined
    })

  } catch (error) {
    console.error('Auth status API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}