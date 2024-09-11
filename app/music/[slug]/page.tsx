/*
 * @Author: ningyongheng ningyongheng@jeejio.com
 * @Date: 2024-09-11 15:34:35
 * @LastEditors: ningyongheng ningyongheng@jeejio.com
 * @LastEditTime: 2024-09-11 15:36:16
 * @FilePath: /tailwind-landing-page-template/app/music/[slug]/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */


export async function generateStaticParams() {
  // 假设你有一些预定义的 id
  let currentPage = [];
  // 假设你有一些预定义的 id
  for (let i = 1; i <= 100; i++) {
    currentPage.push({ slug: i.toString() });
  }
  const posts = currentPage;
  // 返回的数组将作为预生成的静态页面路径
  return posts.map((post) => ({
    slug: post.slug,
  }));
}


export default function Page({ params }: { params: { slug: string } }) {
  return <div>My Music: {params.slug}</div>;
}
