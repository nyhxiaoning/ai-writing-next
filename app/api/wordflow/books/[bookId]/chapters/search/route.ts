import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/wordflow/books/[bookId]/chapters/search?q=keyword
export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const q = request.nextUrl.searchParams.get('q')?.trim();
    if (!q) return NextResponse.json({ results: [] });

    const chapters = await prisma.chapter.findMany({
      where: { bookId: params.bookId, book: { userId: user.userId } },
      select: { id: true, title: true, content: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    });

    const results = chapters
      .map((ch) => {
        // Find matches in content
        const content = ch.content.replace(/<[^>]*>/g, '');
        const idx = content.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return null;
        const start = Math.max(0, idx - 30);
        const end = Math.min(content.length, idx + q.length + 30);
        const snippet = (start > 0 ? '...' : '') + content.slice(start, end) + (end < content.length ? '...' : '');
        return { chapterId: ch.id, chapterTitle: ch.title || `第 ${ch.sortOrder + 1} 章`, snippet };
      })
      .filter(Boolean);

    return NextResponse.json({ results });
  } catch (e) {
    console.error('搜索章节错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
