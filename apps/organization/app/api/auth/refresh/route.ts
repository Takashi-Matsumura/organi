import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'リフレッシュトークンが必要です' },
        { status: 400 }
      )
    }

    const authService = new AuthService()
    const result = authService.refreshToken(refreshToken)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'トークンのリフレッシュに失敗しました' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      permissions: result.permissions,
      token: result.token,
      refreshToken: result.refreshToken
    })

  } catch (error) {
    console.error('Refresh API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}