import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    // Gather writing statistics
    const chapters = await prisma.chapter.findMany({
      where: { bookId: params.bookId, book: { userId: userPayload.userId } },
      select: { wordCount: true, createdAt: true, sortOrder: true },
      orderBy: { sortOrder: 'asc' },
    });

    const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);
    const avgChapterLength = chapters.length > 0 ? Math.round(totalWords / chapters.length) : 0;

    return NextResponse.json({
      analysis: {
        totalWords,
        chapterCount: chapters.length,
        avgChapterLength,
        chapters: chapters.map((c) => ({
          wordCount: c.wordCount,
          createdAt: c.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('获取分析数据错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
