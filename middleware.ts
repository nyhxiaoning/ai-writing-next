import { defaultLocale, locales } from './i18n';

import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    // 支持的语言列表
    locales,

    // 默认语言
    defaultLocale,

    // 语言检测策略 - 启用自动检测
    localeDetection: true,

    // 路径前缀策略 - 默认语言不显示前缀，其他语言显示前缀
    localePrefix: 'as-needed',

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
        }
    }
});

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