import Image from "next/image";
import Link from "next/link";

// TODO:解决静态导出的路由匹配问题
// generateStaticParams 用来指定哪些动态路由页面需要被预生成
export async function generateStaticParams() {
  let currentPage = [];
  // 假设你有一些预定义的 id
  for (let i = 1; i <= 100; i++) {
    currentPage.push({ id: i.toString() });
  }
  const posts = currentPage;

  // 返回的数组将作为预生成的静态页面路径
  return posts.map((post) => ({
    id: post.id,
  }));
}

export default function ArticlePage({ params }) {
  const { id } = params;
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">文章标题{id}</h1>
      <p className="text-lg mb-6">
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
