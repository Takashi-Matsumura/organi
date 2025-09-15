import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    
    if (!token) {
      return NextResponse.json(
        { error: '認証トークンが必要です' },
        { status: 401 }
      )
    }

    // JWTトークンを検証
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = verify(token, JWT_SECRET) as any
    
    // ユーザー情報と認可情報を返す
    const authorizationInfo = {
      userId: decoded.userId,
      username: decoded.username,
      employeeId: decoded.employeeId,
      permissions: decoded.permissions || {
        canRead: true,
        canWrite: false,
        canDelete: false,
        isManager: false
      },
      department: decoded.department || '',
      position: decoded.position || '',
      authorizedAt: new Date().toISOString(),
      tokenValid: true
    }

    return NextResponse.json({
      success: true,
      authorization: authorizationInfo
    })
    
  } catch (error) {
    console.error('Authorization error:', error)
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: '無効な認証トークンです', tokenValid: false },
        { status: 401 }
      )
    }
    
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: '認証トークンの有効期限が切れています', tokenValid: false },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '認可情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// GET メソッドでもアクセス可能にする（Bearerトークンでの認証）
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization ヘッダーが必要です (Bearer token)' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // "Bearer "を除去
    
    // JWTトークンを検証
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
    const decoded = verify(token, JWT_SECRET) as any
    
    // ユーザー情報と認可情報を返す
    const authorizationInfo = {
      userId: decoded.userId,
      username: decoded.username,
      employeeId: decoded.employeeId,
      permissions: decoded.permissions || {
        canRead: true,
        canWrite: false,
        canDelete: false,
        isManager: false
      },
      department: decoded.department || '',
      position: decoded.position || '',
      authorizedAt: new Date().toISOString(),
      tokenValid: true
    }

    return NextResponse.json({
      success: true,
      authorization: authorizationInfo
    })
    
  } catch (error) {
    console.error('Authorization error:', error)
    
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: '無効な認証トークンです', tokenValid: false },
        { status: 401 }
      )
    }
    
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: '認証トークンの有効期限が切れています', tokenValid: false },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: '認可情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}