export interface AuthUser {
  id: string
  username: string
  name: string
  email: string
  department?: string
  section?: string
  course?: string
  ldapDN?: string
}

export interface UserPermissions {
  userId: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  permissions: ('READ' | 'WRITE' | 'DELETE')[]
  description: string
}

export interface AuthResult {
  success: boolean
  user?: AuthUser
  permissions?: UserPermissions
  token?: string
  refreshToken?: string
  error?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthConfig {
  mode: 'ldap' | 'bypass'
  ldap?: {
    url: string
    baseDN: string
    bindDN: string
    bindPassword: string
  }
  jwt: {
    secret: string
    expiresIn: string
    refreshExpiresIn: string
  }
}