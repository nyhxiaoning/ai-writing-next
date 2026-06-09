/**
 * 账号白名单配置
 * 白名单账号可以绕过常规密码验证直接登录
 * 如果用户不存在则自动创建，如果密码不匹配则自动更新
 */
export interface WhitelistAccount {
  email: string
  password: string
  name?: string
}

export const WHITELIST_ACCOUNTS: WhitelistAccount[] = [
  {
    email: '15600705234@163.com',
    password: '1234qwer',
    name: 'Admin',
  },
]

/**
 * 检查邮箱是否在白名单中
 */
export function getWhitelistAccount(email: string): WhitelistAccount | undefined {
  return WHITELIST_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase(),
  )
}
