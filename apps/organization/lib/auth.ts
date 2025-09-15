import { AuthUser, UserPermissions, AuthResult, LoginCredentials, AuthConfig } from '../types/auth'
import { LDAPService } from './ldap'
import { JWTService } from './jwt'

export class AuthService {
  private config: AuthConfig
  private ldapService?: LDAPService
  private jwtService: JWTService

  constructor() {
    this.config = this.loadConfig()
    this.jwtService = new JWTService()
    
    if (this.config.mode === 'ldap' && this.config.ldap) {
      this.ldapService = new LDAPService(this.config.ldap)
    }
  }

  private loadConfig(): AuthConfig {
    return {
      mode: (process.env.AUTH_MODE as 'ldap' | 'bypass') || 'bypass',
      ldap: process.env.AUTH_MODE === 'ldap' ? {
        url: process.env.TEMP_LDAP_URL || process.env.LDAP_URL || '',
        baseDN: process.env.TEMP_LDAP_BASE_DN || process.env.LDAP_BASE_DN || '',
        bindDN: process.env.TEMP_LDAP_BIND_DN || process.env.LDAP_BIND_DN || '',
        bindPassword: process.env.TEMP_LDAP_BIND_PASSWORD || process.env.LDAP_BIND_PASSWORD || ''
      } : undefined,
      jwt: {
        secret: process.env.JWT_SECRET || 'default-secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
      }
    }
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      let user: AuthUser | null = null

      if (this.config.mode === 'ldap') {
        // LDAP認証
        if (!this.ldapService) {
          return {
            success: false,
            error: 'LDAP service not configured'
          }
        }
        
        user = await this.ldapService.authenticate(credentials)
      } else {
        // バイパス認証（開発用）
        user = this.authenticateBypass(credentials)
      }

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials'
        }
      }

      // ユーザー権限取得
      const permissions = this.getUserPermissions(user)

      // JWT生成
      const token = this.jwtService.generateAccessToken(user, permissions)
      const refreshToken = this.jwtService.generateRefreshToken(user, permissions)

      return {
        success: true,
        user,
        permissions,
        token,
        refreshToken
      }

    } catch (error) {
      console.error('Authentication error:', error)
      return {
        success: false,
        error: 'Authentication failed'
      }
    }
  }

  private authenticateBypass(credentials: LoginCredentials): AuthUser | null {
    // 開発用の固定ユーザーアカウント
    const devUsers = [
      {
        username: 'admin',
        password: 'admin123',
        user: {
          id: 'dev-admin',
          username: 'admin',
          name: '管理者（開発用）',
          email: 'admin@dev.local',
          department: 'システム管理部',
          section: 'IT課'
        }
      },
      {
        username: 'editor',
        password: 'editor123',
        user: {
          id: 'dev-editor',
          username: 'editor',
          name: '編集者（開発用）',
          email: 'editor@dev.local',
          department: '人事部',
          section: '人事企画課'
        }
      },
      {
        username: 'viewer',
        password: 'viewer123',
        user: {
          id: 'dev-viewer',
          username: 'viewer',
          name: '閲覧者（開発用）',
          email: 'viewer@dev.local',
          department: '総務部',
          section: '総務課'
        }
      }
    ]

    const account = devUsers.find(
      acc => acc.username === credentials.username && acc.password === credentials.password
    )

    return account ? account.user : null
  }

  private getUserPermissions(user: AuthUser): UserPermissions {
    // デフォルト権限設定（実際の運用では外部DB等から取得）
    const defaultPermissions: Record<string, UserPermissions> = {
      'dev-admin': {
        userId: user.id,
        role: 'ADMIN',
        permissions: ['READ', 'WRITE', 'DELETE'],
        description: '管理者権限 - 全操作可能'
      },
      'dev-editor': {
        userId: user.id,
        role: 'EDITOR',
        permissions: ['READ', 'WRITE'],
        description: '編集者権限 - 閲覧・編集可能'
      },
      'dev-viewer': {
        userId: user.id,
        role: 'VIEWER',
        permissions: ['READ'],
        description: '閲覧者権限 - 閲覧のみ'
      }
    }

    // LDAP認証の場合のデフォルト権限
    if (this.config.mode === 'ldap') {
      return {
        userId: user.id,
        role: 'VIEWER',
        permissions: ['READ'],
        description: 'デフォルト権限 - 閲覧のみ'
      }
    }

    return defaultPermissions[user.id] || {
      userId: user.id,
      role: 'VIEWER',
      permissions: ['READ'],
      description: 'デフォルト権限 - 閲覧のみ'
    }
  }

  verifyToken(token: string): AuthResult {
    const payload = this.jwtService.verifyToken(token)
    
    if (!payload || payload.type !== 'access') {
      return {
        success: false,
        error: 'Invalid token'
      }
    }

    return {
      success: true,
      user: payload.user,
      permissions: payload.permissions
    }
  }

  refreshToken(refreshToken: string): AuthResult {
    const payload = this.jwtService.verifyToken(refreshToken)
    
    if (!payload || payload.type !== 'refresh') {
      return {
        success: false,
        error: 'Invalid refresh token'
      }
    }

    // 新しいトークンを生成（ユーザー情報と権限は最新のものを取得すべき）
    const newToken = this.jwtService.generateAccessToken(payload.user, payload.permissions)
    const newRefreshToken = this.jwtService.generateRefreshToken(payload.user, payload.permissions)

    return {
      success: true,
      user: payload.user,
      permissions: payload.permissions,
      token: newToken,
      refreshToken: newRefreshToken
    }
  }
}