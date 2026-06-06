import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      take: 50,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({
      posts: posts.map((p) => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        type: p.type,
        likes: p.likes,
        views: p.views,
        commentsCount: p._count.comments,
        pinned: p.pinned,
        user: p.user,
        createdAt: p.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('获取社区帖子错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
