import ldap from 'ldapjs'
import { AuthUser, LoginCredentials, AuthConfig } from '../types/auth'

export class LDAPService {
  private config: AuthConfig['ldap']

  constructor(config: AuthConfig['ldap']) {
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
      // サービスアカウントでバインド
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

    } catch (error) {
      console.error('LDAP authentication failed:', error)
      return null
    } finally {
      client.unbind(() => {})
    }
  }

  private bind(client: ldap.Client, dn: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      client.bind(dn, password, (err) => {
        if (err) {
          reject(err)
        } else {
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