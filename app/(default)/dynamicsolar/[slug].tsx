"use client";

import { useRouter } from "next/navigation";

export default function PostPage() {
  const router = useRouter();

  return (
    <div>
      <h1>文章页面 - slug: {JSON.stringify(router)}</h1>
      {/* 根据 slug 加载相应的文章内容 */}
    </div>
  );
}
