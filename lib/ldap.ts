import ldap from 'ldapjs'
import { AuthUser, LoginCredentials, AuthConfig } from '../types/auth'

export class LDAPService {
  private config: AuthConfig['ldap']

  constructor(config: AuthConfig['ldap']) {
    console.log('LDAPService constructor called with config:', {
      url: config?.url || 'MISSING',
      baseDN: config?.baseDN || 'MISSING',
      bindDN: config?.bindDN || 'NOT SET',
      bindPassword: config?.bindPassword ? 'SET' : 'NOT SET'
    })
    this.config = config
  }

  async authenticate(credentials: LoginCredentials): Promise<AuthUser | null> {
    if (!this.config) {
      throw new Error('LDAP configuration not provided')
    }

    const client = ldap.createClient({
      url: this.config.url,
      timeout: 10000,
      connectTimeout: 10000
    })

    try {
      // bindDN/bindPasswordが提供されている場合はサービスアカウントでバインド
      if (this.config.bindDN && this.config.bindPassword) {
        await this.bind(client, this.config.bindDN, this.config.bindPassword)
        
        // ユーザー検索
        const userDN = await this.searchUser(client, credentials.username)
        if (!userDN) {
          return null
        }

        // ユーザー認証
        await this.bind(client, userDN, credentials.password)

        // ユーザー情報取得
        const userInfo = await this.getUserInfo(client, userDN)
        return userInfo
      } else {
        // 直接ユーザー認証を試行（匿名バインドまたは簡易認証）
        const userDN = this.constructUserDN(credentials.username)
        
        // ユーザー認証
        await this.bind(client, userDN, credentials.password)

        // ユーザー情報取得
        const userInfo = await this.getUserInfo(client, userDN)
        return userInfo
      }

    } catch (error) {
      console.error('LDAP authentication failed:', error)
      return null
    } finally {
      client.unbind(() => {})
    }
  }

  private constructUserDN(username: string): string {
    if (!this.config) {
      throw new Error('LDAP configuration not provided')
    }
    
    console.log('Constructing user DN:', { username, baseDN: this.config.baseDN })
    
    // 一般的なユーザーDN構築パターン（企業によって異なる）
    // cn=username,baseDN または uid=username,baseDN
    const userDN = `cn=${username},${this.config.baseDN}`
    console.log('Constructed user DN:', userDN)
    
    return userDN
  }

  private bind(client: ldap.Client, dn: string, password: string): Promise<void> {
    console.log('LDAP bind attempt:', { dn: dn || 'EMPTY', password: password ? 'SET' : 'EMPTY' })
    
    if (!dn || !password) {
      return Promise.reject(new Error(`Invalid bind parameters: dn=${dn}, password=${password ? 'SET' : 'EMPTY'}`))
    }
    
    return new Promise((resolve, reject) => {
      client.bind(dn, password, (err: any) => {
        if (err) {
          console.log('LDAP bind failed:', err.message || err)
          reject(err)
        } else {
          console.log('LDAP bind successful')
          resolve()
        }
      })
    })
  }

  private searchUser(client: ldap.Client, username: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      if (!this.config) {
        reject(new Error('LDAP configuration not provided'))
        return
      }

      const opts = {
        filter: `(|(uid=${username})(sAMAccountName=${username}))`,
        scope: 'sub' as const,
        attributes: ['dn']
      }

      client.search(this.config.baseDN, opts, (err, res) => {
        if (err) {
          reject(err)
          return
        }

        let userDN: string | null = null

        res.on('searchEntry', (entry) => {
          userDN = entry.dn.toString()
        })

        res.on('error', (err) => {
          reject(err)
        })

        res.on('end', () => {
          resolve(userDN)
        })
      })
    })
  }

  private getUserInfo(client: ldap.Client, userDN: string): Promise<AuthUser> {
    return new Promise((resolve, reject) => {
      const opts = {
        filter: '(objectClass=*)',
        scope: 'base' as const,
        attributes: ['uid', 'sAMAccountName', 'cn', 'displayName', 'mail', 'department', 'ou']
      }

      client.search(userDN, opts, (err, res) => {
        if (err) {
          reject(err)
          return
        }

        let userInfo: AuthUser | null = null

        res.on('searchEntry', (entry) => {
          const attrs = entry.attributes.reduce((acc, attr) => {
            acc[attr.type] = Array.isArray(attr.vals) ? attr.vals[0] : attr.vals
            return acc
          }, {} as any)

          userInfo = {
            id: attrs.uid || attrs.sAMAccountName || userDN,
            username: attrs.uid || attrs.sAMAccountName,
            name: attrs.displayName || attrs.cn || attrs.uid,
            email: attrs.mail || '',
            department: attrs.department || undefined,
            section: attrs.ou || undefined,
            ldapDN: userDN
          }
        })

        res.on('error', (err) => {
          reject(err)
        })

        res.on('end', () => {
          if (userInfo) {
            resolve(userInfo)
          } else {
            reject(new Error('User information not found'))
          }
        })
      })
    })
  }
}