import ldap from 'ldapjs'
import { AuthUser, LoginCredentials, AuthConfig } from '../types/auth'

/**
 * LDAP認証サービスクラス
 * 社内LDAPサーバーとの認証を処理します
 */
export class LDAPService {
  private readonly config: AuthConfig['ldap']
  private readonly timeout = 10000
  private readonly connectTimeout = 10000

  constructor(config: AuthConfig['ldap']) {
    if (!config?.url || !config?.baseDN) {
      throw new Error('LDAP configuration requires url and baseDN')
    }
    this.config = config
  }

  /**
   * LDAP認証を実行します
   * @param credentials ユーザー認証情報
   * @returns 認証成功時はユーザー情報、失敗時はnull
   */
  async authenticate(credentials: LoginCredentials): Promise<AuthUser | null> {
    const client = this.createClient()

    try {
      if (this.hasServiceAccount()) {
        return await this.authenticateWithServiceAccount(client, credentials)
      } else {
        return await this.authenticateDirectly(client, credentials)
      }
    } catch (error) {
      console.error('LDAP authentication failed:', error)
      return null
    } finally {
      this.closeClient(client)
    }
  }

  /**
   * サービスアカウントを使用した認証
   */
  private async authenticateWithServiceAccount(
    client: ldap.Client,
    credentials: LoginCredentials
  ): Promise<AuthUser | null> {
    if (!this.config?.bindDN || !this.config?.bindPassword) {
      throw new Error('Service account credentials not available')
    }

    await this.bind(client, this.config.bindDN, this.config.bindPassword)
    
    const userDN = await this.searchUser(client, credentials.username)
    if (!userDN) {
      return null
    }

    await this.bind(client, userDN, credentials.password)
    return await this.getUserInfo(client, userDN)
  }

  /**
   * 直接ユーザー認証（複数のDNパターンを試行）
   */
  private async authenticateDirectly(
    client: ldap.Client,
    credentials: LoginCredentials
  ): Promise<AuthUser | null> {
    const dnPatterns = this.getUserDNPatterns(credentials.username)
    
    for (const userDN of dnPatterns) {
      try {
        await this.bind(client, userDN, credentials.password)
        return await this.getUserInfo(client, userDN)
      } catch {
        // 次のパターンを試行
        continue
      }
    }
    
    throw new Error('Authentication failed with all DN patterns')
  }

  /**
   * ユーザーDNパターンを生成します
   * @param username ユーザー名
   * @returns DNパターンの配列（成功確率の高い順）
   */
  private getUserDNPatterns(username: string): string[] {
    if (!this.config?.baseDN) {
      throw new Error('LDAP baseDN not configured')
    }
    
    return [
      `uid=${username},${this.config.baseDN}`,           // OpenLDAP標準形式
      `sAMAccountName=${username},${this.config.baseDN}`, // Active Directory
      `cn=${username},${this.config.baseDN}`,            // 基本形式
      `${username}@occ.co.jp`                            // UPN形式
    ]
  }

  /**
   * LDAPバインド操作を実行します
   * @param client LDAPクライアント
   * @param dn バインドDN
   * @param password パスワード
   */
  private bind(client: ldap.Client, dn: string, password: string): Promise<void> {
    if (!dn || !password) {
      return Promise.reject(new Error('Invalid bind parameters: DN and password are required'))
    }
    
    return new Promise((resolve, reject) => {
      client.bind(dn, password, (err: unknown) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  /**
   * LDAPユーザー検索を実行します
   * @param client LDAPクライアント
   * @param username 検索するユーザー名
   * @returns ユーザーDNまたはnull
   */
  private searchUser(client: ldap.Client, username: string): Promise<string | null> {
    if (!this.config?.baseDN) {
      return Promise.reject(new Error('LDAP baseDN not configured'))
    }

    const searchOptions = {
      filter: `(|(uid=${username})(sAMAccountName=${username}))`,
      scope: 'sub' as const,
      attributes: ['dn']
    }

    return new Promise((resolve, reject) => {
      client.search(this.config.baseDN!, searchOptions, (err, res) => {
        if (err) {
          reject(err)
          return
        }

        let userDN: string | null = null

        res.on('searchEntry', (entry) => {
          userDN = entry.dn.toString()
        })

        res.on('error', (searchErr) => {
          reject(searchErr)
        })

        res.on('end', () => {
          resolve(userDN)
        })
      })
    })
  }

  /**
   * LDAPユーザー情報を取得します
   * @param client LDAPクライアント
   * @param userDN ユーザーDN
   * @returns ユーザー情報
   */
  private getUserInfo(client: ldap.Client, userDN: string): Promise<AuthUser> {
    const searchOptions = {
      filter: '(objectClass=*)',
      scope: 'base' as const,
      attributes: ['*']  // すべての属性を取得
    }

    return new Promise((resolve, reject) => {
      client.search(userDN, searchOptions, (err, res) => {
        if (err) {
          reject(err)
          return
        }

        let userInfo: AuthUser | null = null

        res.on('searchEntry', (entry) => {
          const attrs = this.parseAttributes(entry.attributes)
          
          // デバッグ用：取得した全属性をログ出力
          console.log('LDAP attributes retrieved:', Object.keys(attrs))
          console.log('LDAP attribute values:', attrs)

          userInfo = {
            id: attrs.uid || attrs.sAMAccountName || userDN,
            username: attrs.uid || attrs.sAMAccountName || '',
            name: attrs.displayName || attrs.cn || attrs.name || attrs.uid || '',
            email: attrs.mail || '',
            department: attrs.department,
            section: attrs.ou,
            ldapDN: userDN,
            // 御社LDAP固有の属性マッピング
            employeeID: attrs.uidNumber,  // 社員IDとしてuidNumberを使用
            employeeNumber: attrs.uidNumber,
            title: attrs.title,
            company: attrs.company,
            division: attrs.division,
            telephoneNumber: attrs.telephoneNumber,
            mobile: attrs.mobile,
            manager: attrs.manager,
            givenName: attrs.givenName,
            surname: attrs.sn,
            description: attrs.gecos || attrs.description,  // gecos（ユーザー説明）を使用
            memberOf: attrs.memberOf ? [attrs.memberOf] : undefined
          }
        })

        res.on('error', (searchErr) => {
          reject(searchErr)
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

  /**
   * LDAP属性をパースします
   * @param attributes LDAP属性配列
   * @returns パースされた属性オブジェクト
   */
  private parseAttributes(attributes: ldap.Attribute[]): Record<string, string> {
    return attributes.reduce((acc, attr) => {
      const value = Array.isArray(attr.values) ? attr.values[0] : attr.values
      acc[attr.type] = typeof value === 'string' ? value : String(value || '')
      return acc
    }, {} as Record<string, string>)
  }

  /**
   * LDAPクライアントを作成します
   * @returns LDAPクライアント
   */
  private createClient(): ldap.Client {
    return ldap.createClient({
      url: this.config!.url,
      timeout: this.timeout,
      connectTimeout: this.connectTimeout
    })
  }

  /**
   * LDAPクライアントを閉じます
   * @param client LDAPクライアント
   */
  private closeClient(client: ldap.Client): void {
    client.unbind(() => {})
  }

  /**
   * サービスアカウントが設定されているかチェックします
   * @returns サービスアカウントが設定されているか
   */
  private hasServiceAccount(): boolean {
    return !!(this.config?.bindDN && this.config?.bindPassword)
  }
}