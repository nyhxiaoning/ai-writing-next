import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/wordflow/books/[bookId] - Get single book with chapters
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
      include: {
        chapters: {
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
        },
        _count: { select: { chapters: true } },
      },
    });

    if (!book) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    return NextResponse.json({ book });
  } catch (error) {
    console.error('获取书籍错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT /api/wordflow/books/[bookId] - Update book
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { title, genre, description, wordGoal, status } = await request.json();

    const book = await prisma.book.findFirst({
      where: { id: params.bookId, userId: userPayload.userId },
    });

    if (!book) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    const updated = await prisma.book.update({
      where: { id: params.bookId },
      data: {
        ...(title !== undefined && { title }),
        ...(genre !== undefined && { genre }),
        ...(description !== undefined && { description }),
        ...(wordGoal !== undefined && { wordGoal }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ book: updated });
  } catch (error) {
    console.error('更新书籍错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// DELETE /api/wordflow/books/[bookId] - Delete book
export async function DELETE(
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

    await prisma.book.delete({ where: { id: params.bookId } });

    return NextResponse.json({ message: '作品已删除' });
  } catch (error) {
    console.error('删除书籍错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
