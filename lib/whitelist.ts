/**
 * 白名单路由配置
 * 定义哪些路由可以在未登录状态下访问
 */

// 白名单路由前缀列表
const WHITELIST_PREFIXES: string[] = [
  '/api/wordflow',
];

/**
 * 检查请求路径是否在白名单中
 */
export function isPathWhitelisted(pathname: string): boolean {
  return WHITELIST_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/**
 * 检查请求是否允许以访客身份访问
 * 当前策略：白名单内的 GET 请求允许访客访问
 */
export function isGuestAllowed(pathname: string, method: string): boolean {
  if (method !== 'GET') return false;
  return isPathWhitelisted(pathname);
}
