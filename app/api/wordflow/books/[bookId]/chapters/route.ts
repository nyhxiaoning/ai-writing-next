import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/wordflow/books/[bookId]/chapters - List chapters
export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const book = await prisma.book.findFirst({
      where: { id: params.bookId, userId: userPayload.userId },
    });
    if (!book) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    const chapters = await prisma.chapter.findMany({
      where: { bookId: params.bookId },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        wordCount: true,
        sortOrder: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('获取章节列表错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/wordflow/books/[bookId]/chapters - Create chapter
export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const book = await prisma.book.findFirst({
      where: { id: params.bookId, userId: userPayload.userId },
    });
    if (!book) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    const { title } = await request.json();

    // Get max sortOrder
    const lastChapter = await prisma.chapter.findFirst({
      where: { bookId: params.bookId },
      orderBy: { sortOrder: 'desc' },
    });

    const chapter = await prisma.chapter.create({
      data: {
        title: title || '新章节',
        content: '',
        sortOrder: (lastChapter?.sortOrder ?? -1) + 1,
        bookId: params.bookId,
      },
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    console.error('创建章节错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
