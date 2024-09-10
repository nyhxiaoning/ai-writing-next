import Image from "next/image";
import Link from "next/link";

export default function ArticlePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">文章标题</h1>
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
