/*
 * @Author: ningyongheng ningyongheng@jeejio.com
 * @Date: 2024-03-07 13:35:05
 * @LastEditors: ningyongheng ningyongheng@jeejio.com
 * @LastEditTime: 2024-09-11 15:28:28
 * @FilePath: /next-blog-manage-system/src/pages/routestudy/index.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Link from 'next/link';
const routeStudy = ({ posts }: { posts: any }) => {

    const postsmock = [
        { id: 1, slug: '1', title: 'Post 1' },
        { id: 2, slug: '2', title: 'Post 2' },
        { id: 3, slug: '3', title: 'Post 3' }
    ];

    return (
        <div>
            <h1>Route Study</h1>
            <ul>
                <li>
                    <Link legacyBehavior href="/">
                        <a>Home回主页</a>
                    </Link>
                </li>
                <li>
                    <Link legacyBehavior href="/file/md">
                        <a>md文件跳转</a>
                    </Link>
                </li>
                <li>
                    <Link legacyBehavior href="/code">
                        <a>进入code页面</a>
                    </Link>
                </li>
                <li>
                    <Link legacyBehavior href="">Linking to Dynamic Segments匹配动态部分</Link>
                </li>
            </ul>
            <ul>
                客户端渲染汇总
                {postsmock.map((postsItem: any) => (
                    <li key={postsItem.id}>
                        <Link href={`/blog/${postsItem.slug}`}>{postsItem.title}</Link>
                    </li>
                ))}
            </ul>
            <ul>
                服务端渲染汇总
                {postsmock.map((postsItem: any) => (
                    <li key={postsItem.id}>
                        <Link href={`/detail/${postsItem.slug}`}>{postsItem.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default routeStudy;