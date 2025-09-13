import jwt from 'jsonwebtoken'
import { AuthUser, UserPermissions } from '../types/auth'

interface JWTPayload {
  user: AuthUser
  permissions: UserPermissions
  type: 'access' | 'refresh'
  iat: number
  exp: number
}

export class JWTService {
  private secret: string
  private accessExpiresIn: string
  private refreshExpiresIn: string

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret-change-this'
    this.accessExpiresIn = process.env.JWT_EXPIRES_IN || '24h'
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  }

  generateAccessToken(user: AuthUser, permissions: UserPermissions): string {
    const payload = {
      user,
      permissions,
      type: 'access'
    }
    
    return jwt.sign(payload, this.secret, {
      expiresIn: this.accessExpiresIn,
      issuer: 'organi-auth',
      subject: user.id
    })
  }

  generateRefreshToken(user: AuthUser, permissions: UserPermissions): string {
    const payload = {
      user: { id: user.id, username: user.username },
      permissions: { userId: permissions.userId, role: permissions.role },
      type: 'refresh'
    }
    
    return jwt.sign(payload, this.secret, {
      expiresIn: this.refreshExpiresIn,
      issuer: 'organi-auth',
      subject: user.id
    })
  }

  verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret, {
        issuer: 'organi-auth'
      }) as JWTPayload
      
      return decoded
    } catch (error) {
      console.error('JWT verification failed:', error)
      return null
    }
  }

  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload
    } catch (error) {
      console.error('JWT decode failed:', error)
      return null
    }
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token)
    if (!decoded) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  }
}