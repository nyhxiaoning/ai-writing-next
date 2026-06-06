import { defaultLocale, locales } from './i18n';
import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// 需要认证的路径
const protectedPaths = ['/dashboard', '/wordflow'];

// 认证相关路径
const authPaths = ['/auth/signin', '/auth/signup', '/auth/reset-password'];

// 创建国际化中间件
const intlMiddleware = createMiddleware({
    // 支持的语言列表
    locales,

    // 默认语言
    defaultLocale,

    // 语言检测策略 - 禁用自动检测，使用默认语言
    localeDetection: false,

    // 路径前缀策略 - 所有语言都显示前缀
    localePrefix: 'always',

    // 备用语言链接
    alternateLinks: false,

    // 路径名本地化
    pathnames: {
        '/': '/',
        '/about': {
            zh: '/about',
            en: '/about',
            ja: '/about'
        },
        '/contact': {
            zh: '/contact',
            en: '/contact',
            ja: '/contact'
        },
        '/dashboard': {
            zh: '/dashboard',
            en: '/dashboard',
            ja: '/dashboard'
        },
        '/auth/signin': {
            zh: '/auth/signin',
            en: '/auth/signin',
            ja: '/auth/signin'
        },
        '/wordflow': {
            zh: '/wordflow',
            en: '/wordflow',
            ja: '/wordflow'
        }
    }
});

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // 获取当前语言
    const locale = pathname.split('/')[1];
    const isValidLocale = locales.includes(locale as any);
    
    // 获取实际路径（去除语言前缀）
    const actualPath = isValidLocale ? pathname.slice(locale.length + 1) || '/' : pathname;
    
    // 检查是否为受保护的路径
    const isProtectedPath = protectedPaths.some(path => actualPath.startsWith(path));
    
    // 检查是否为认证路径
    const isAuthPath = authPaths.some(path => actualPath.startsWith(path));
    
    // 从 cookie 中获取JWT认证令牌
    const authToken = request.cookies.get('auth-token');
    let isAuthenticated = false;
    
    if (authToken) {
        try {
            // 这里可以添加JWT验证逻辑
            // 为了性能考虑，中间件中只做简单检查
            // 完整的JWT验证在API路由中进行
            isAuthenticated = !!authToken.value;
        } catch (error) {
            // Token 解析失败，视为未认证
            isAuthenticated = false;
        }
    }
    
    // 如果访问受保护的路径但未认证，重定向到登录页
    if (isProtectedPath && !isAuthenticated) {
        const signInUrl = new URL(isValidLocale ? `/${locale}/auth/signin` : '/auth/signin', request.url);
        return NextResponse.redirect(signInUrl);
    }
    
    // 如果已认证但访问认证页面，重定向到仪表板
    if (isAuthPath && isAuthenticated) {
        const dashboardUrl = new URL(isValidLocale ? `/${locale}/dashboard` : '/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }
    
    // 应用国际化中间件
    return intlMiddleware(request);
}

export const config = {
    // 匹配所有路径，除了以下路径：
    // - api 路由
    // - _next 静态文件
    // - _vercel 部署文件
    // - 图片和其他静态资源
    matcher: [
        // 匹配所有路径除了以下开头的：
        '/((?!api|_next|_vercel|.*\\..*).*)',
        // 可选：也匹配根路径
        '/'
    ]
};