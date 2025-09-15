import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '../../../../lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'トークンが提供されていません' },
        { status: 401 }
      )
    }

    const authService = new AuthService()
    const result = authService.verifyToken(token)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'トークンが無効です' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      permissions: result.permissions
    })

  } catch (error) {
    console.error('Verify API error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}