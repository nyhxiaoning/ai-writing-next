/*
 * @Author: ningyongheng ningyongheng@jeejio.com
 * @Date: 2024-09-13 14:01:38
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2024-09-16 13:45:52
 * @FilePath: /tailwind-landing-page-template/app/blog/[season]/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Image from "next/image";
import Link from "next/link";

// TODO:解决静态导出的路由匹配问题
// generateStaticParams 用来指定哪些动态路由页面需要被预生成
export async function generateStaticParams() {
  let currentPage = [];
  // 假设你有一些预定义的 id
  for (let i = 1; i <= 100; i++) {
    currentPage.push({ season: i.toString() });
  }
  const posts = currentPage;

  // 返回的数组将作为预生成的静态页面路径
  return posts.map((post) => ({
    season: post.season,
  }));
}

export default function ArticlePage({ params }: any) {
  const solarTerms = [
    "立春",
    "雨水",
    "惊蛰",
    "春分",
    "清明",
    "谷雨",
    "立夏",
    "小满",
    "芒种",
    "夏至",
    "小暑",
    "大暑",
    "立秋",
    "处暑",
    "白露",
    "秋分",
    "寒露",
    "霜降",
    "立冬",
    "小雪",
    "大雪",
    "冬至",
    "小寒",
    "大寒",
  ];
  const { id } = params;
  // TODO：未来这里通过接口查找文章内容，在下面渲染
  // TODO：未来这里通过接口查找文章内容，在下面渲染
  // TODO：未来这里通过接口查找文章内容，在下面渲染
  // TODO：未来这里通过接口查找文章内容，在下面渲染
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{solarTerms[id - 1]}</h1>
      <p className="text-lg mb-6">
        季节列表：春天文章汇总：跳到二十四节气
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>
      <Image
        src="/path/to/article-image.jpg"
        width={500}
        height={300}
        alt="文章配图"
      />
      <Link href="/" className="text-blue-500 underline mt-4">
        返回首页
      </Link>
    </div>
  );
}
