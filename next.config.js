/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    // 启用 Pages Router 和 App Router 并行支持
    experimental: {
        // 允许 Pages Router 和 App Router 共存
        appDir: true,
    },
    // 确保静态导出时包含 Pages Router 页面
    trailingSlash: true,
    // 配置重写规则，确保路由正确处理
    async rewrites() {
        return [
            // Pages Router 路由优先级配置
            {
                source: '/pages-demo',
                destination: '/pages-demo',
            },
            {
                source: '/api/:path*',
                destination: '/api/:path*',
            },
        ]
    },
}

module.exports = nextConfig
