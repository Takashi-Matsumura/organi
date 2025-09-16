import { NextRequest, NextResponse } from 'next/server'
import { LDAPService } from '../../../../lib/ldap'

interface LDAPTestRequest {
  ldapConfig: {
    url: string
    baseDN: string
    bindDN?: string
    bindPassword?: string
  }
  credentials: {
    username: string
    password: string
  }
}

interface LDAPTestResponse {
  success: boolean
  message?: string
  user?: {
    id: string
    username: string
    name: string
    email: string
    department?: string
    section?: string
    employeeID?: string
    employeeNumber?: string
    title?: string
    company?: string
    division?: string
    telephoneNumber?: string
    mobile?: string
    givenName?: string
    surname?: string
    ldapDN?: string
  }
  error?: string
}

/**
 * LDAP接続テストAPI
 * フロントエンドからのLDAP設定をテストし、認証が正常に動作するかを確認します
 */
export async function POST(request: NextRequest): Promise<NextResponse<LDAPTestResponse>> {
  try {
    const body = await request.json() as LDAPTestRequest
    const { ldapConfig, credentials } = body

    // リクエストバリデーション
    const validationError = validateRequest(ldapConfig, credentials)
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      )
    }

    // LDAP認証テスト実行
    const ldapService = new LDAPService({
      url: ldapConfig.url,
      baseDN: ldapConfig.baseDN,
      bindDN: ldapConfig.bindDN,
      bindPassword: ldapConfig.bindPassword
    })
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
          section: user.section,
          employeeID: user.employeeID,
          employeeNumber: user.employeeNumber,
          title: user.title,
          company: user.company,
          division: user.division,
          telephoneNumber: user.telephoneNumber,
          mobile: user.mobile,
          givenName: user.givenName,
          surname: user.surname,
          ldapDN: user.ldapDN
        }
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'LDAP認証に失敗しました。ユーザー名またはパスワードが間違っています。' 
        },
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

/**
 * リクエストデータのバリデーション
 * @param ldapConfig LDAP設定
 * @param credentials 認証情報
 * @returns エラーメッセージまたはnull
 */
function validateRequest(
  ldapConfig: LDAPTestRequest['ldapConfig'], 
  credentials: LDAPTestRequest['credentials']
): string | null {
  if (!ldapConfig || !credentials) {
    return 'LDAP設定と認証情報が必要です'
  }

  if (!ldapConfig.url || !ldapConfig.baseDN) {
    return 'LDAP URLとBase DNが必要です'
  }

  if (!credentials.username || !credentials.password) {
    return 'ユーザー名とパスワードが必要です'
  }

  return null
}