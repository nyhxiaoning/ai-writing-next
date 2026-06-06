'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare, Heart, Eye, Plus, Pin } from 'lucide-react';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  excerpt?: string;
  type: string;
  likes: number;
  views: number;
  commentsCount?: number;
  pinned: boolean;
  user: { id: number; name: string; avatar?: string };
  createdAt: string;
}

export default function CommunityPage() {
  const t = useTranslations('WordFlow.community');
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'zh';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/wordflow/community/posts')
      .then((r) => r.json())
      .then((data) => setPosts(data.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const typeColors: Record<string, string> = {
    post: 'bg-blue-100 text-blue-700',
    question: 'bg-amber-100 text-amber-700',
    showcase: 'bg-green-100 text-green-700',
    tutorial: 'bg-purple-100 text-purple-700',
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">{t('feed')}</h2>
        <button className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> {t('newPost')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-20">
          <MessageSquare className="mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-500">{t('noPosts')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="group relative rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md">
              {post.pinned && (
                <span className="absolute right-3 top-3 text-xs text-gray-400">
                  <Pin className="h-3.5 w-3.5" />
                </span>
              )}
              <div className="flex items-start gap-3">
                {post.user.avatar ? (
                  <img src={post.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                    {post.user.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{post.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${typeColors[post.type] || typeColors.post}`}>
                      {t(`postType_${post.type}` as any)}
                    </span>
                  </div>
                  {post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-gray-500">{post.excerpt}</p>}
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>{post.user.name}</span>
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {post.views}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
