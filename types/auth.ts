export interface AuthUser {
  id: string
  username: string
  name: string
  email: string
  department?: string
  section?: string
  course?: string
  ldapDN?: string
  // 追加のLDAP属性
  employeeID?: string
  employeeNumber?: string
  title?: string
  company?: string
  division?: string
  telephoneNumber?: string
  mobile?: string
  manager?: string
  givenName?: string
  surname?: string
  description?: string
  memberOf?: string[]
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
    bindDN?: string
    bindPassword?: string
  }
  jwt: {
    secret: string
    expiresIn: string
    refreshExpiresIn: string
  }
}