import * as React from 'react'

/*
 * @Author: ningyongheng ningyongheng@jeejio.com
 * @Date: 2024-09-11 14:34:38
 * @LastEditors: ningyongheng ningyongheng@jeejio.com
 * @LastEditTime: 2024-09-13 19:10:33
 * @FilePath: /tailwind-landing-page-template/app/blog/[id]/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Image from "next/image";
import Link from "next/link";
import TestCom from './test'

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
      <TestCom ></TestCom>
      <h1 className="text-3xl font-bold mb-4">{solarTerms[id - 1]}: 走走停停</h1>

      <pre>

        1

























        0
      </pre>






      <p className="text-lg mb-6">
        假装文章非常长，文章读完，给一个读完了，效果；


        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>
      <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
        这是一篇文章的内容，这里可以详细介绍文章的主题、观点和故事等。
      </p>  <p className="text-lg mb-6">
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
