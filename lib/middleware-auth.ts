import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from './auth';

/**
 * 认证中间件
 * 检查用户是否已登录
 */
export function authMiddleware(request: NextRequest) {
  const user = getUserFromRequest(request);
  
  if (!user) {
    // 获取当前语言
    const pathname = request.nextUrl.pathname;
    const locale = pathname.split('/')[1] || 'zh';
    
    // 重定向到登录页面
    const loginUrl = new URL(`/${locale}/auth/signin`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

/**
 * 检查路径是否需要认证
 */
export function requiresAuth(pathname: string): boolean {
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/settings',
  ];
  
  // 移除语言前缀来检查路径
  const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
  
  return protectedPaths.some(path => 
    pathWithoutLocale.startsWith(path)
  );
}