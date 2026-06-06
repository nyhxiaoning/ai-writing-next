import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET - list versions for a chapter
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
      where: { id: params.chapterId },
      include: { book: { select: { userId: true } } },
    });

    if (!chapter || chapter.book.userId !== userPayload.userId) {
      return NextResponse.json({ error: '章节不存在' }, { status: 404 });
    }

    const versions = await prisma.chapterVersion.findMany({
      where: { chapterId: params.chapterId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('获取版本历史错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST - create a manual version snapshot
export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string; chapterId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: params.chapterId },
      include: { book: { select: { userId: true } } },
    });

    if (!chapter || chapter.book.userId !== userPayload.userId) {
      return NextResponse.json({ error: '章节不存在' }, { status: 404 });
    }

    const { note } = await request.json();

    const version = await prisma.chapterVersion.create({
      data: {
        content: chapter.content,
        wordCount: chapter.wordCount,
        note: note || null,
        chapterId: params.chapterId,
      },
    });

    return NextResponse.json({ version }, { status: 201 });
  } catch (error) {
    console.error('创建版本快照错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
