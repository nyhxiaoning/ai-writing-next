import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/wordflow/books/[bookId]/chapters/reorder
export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { chapterIds } = (await request.json()) as { chapterIds: string[] };
    if (!Array.isArray(chapterIds)) {
      return NextResponse.json({ error: '无效的请求数据' }, { status: 400 });
    }

    // Verify ownership
    const book = await prisma.book.findFirst({
      where: { id: params.bookId, userId: userPayload.userId },
    });
    if (!book) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      chapterIds.map((id, index) =>
        prisma.chapter.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return NextResponse.json({ message: '排序已更新' });
  } catch (error) {
    console.error('重新排序错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
