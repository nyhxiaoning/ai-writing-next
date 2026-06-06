import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/wordflow/books/[bookId]/chapters/[chapterId] - Get chapter content
export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string; chapterId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: params.chapterId, bookId: params.bookId },
      include: {
        book: { select: { userId: true } },
      },
    });

    if (!chapter || chapter.book.userId !== userPayload.userId) {
      return NextResponse.json({ error: '章节不存在' }, { status: 404 });
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error('获取章节错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT /api/wordflow/books/[bookId]/chapters/[chapterId] - Update chapter
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookId: string; chapterId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: params.chapterId, bookId: params.bookId },
      include: { book: { select: { userId: true } } },
    });

    if (!chapter || chapter.book.userId !== userPayload.userId) {
      return NextResponse.json({ error: '章节不存在' }, { status: 404 });
    }

    const { title, content, status, sortOrder } = await request.json();

    // Create a version snapshot before updating (if content changed)
    if (content !== undefined && content !== chapter.content) {
      await prisma.chapterVersion.create({
        data: {
          content: chapter.content,
          wordCount: chapter.wordCount,
          chapterId: params.chapterId,
        },
      });
    }

    const wordCount = content ? content.replace(/<[^>]*>/g, '').length : 0;

    const updated = await prisma.chapter.update({
      where: { id: params.chapterId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content, wordCount }),
        ...(status !== undefined && { status }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return NextResponse.json({ chapter: updated });
  } catch (error) {
    console.error('更新章节错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// DELETE /api/wordflow/books/[bookId]/chapters/[chapterId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string; chapterId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: params.chapterId, bookId: params.bookId },
      include: { book: { select: { userId: true } } },
    });

    if (!chapter || chapter.book.userId !== userPayload.userId) {
      return NextResponse.json({ error: '章节不存在' }, { status: 404 });
    }

    await prisma.chapter.delete({ where: { id: params.chapterId } });

    return NextResponse.json({ message: '章节已删除' });
  } catch (error) {
    console.error('删除章节错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
