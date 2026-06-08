const withNextIntl = require('next-intl/plugin')(
  // 指定 i18n 配置文件路径
  './i18n.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
    // 注释掉 output: 'export' 因为国际化需要服务端渲染
    // output: 'export',
    images: {
        unoptimized: true,
    },
    // 移除 trailingSlash，可能与国际化路由冲突
    // trailingSlash: true,
    // 每次构建生成唯一 ID，避免 Vercel 缓存污染
    generateBuildId: async () => {
        return `build-${Date.now()}`;
    },
}

module.exports = withNextIntl(nextConfig);
