import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/wordflow/books - List user's books
export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const books = await prisma.book.findMany({
      where: { userId: userPayload.userId },
      include: {
        _count: { select: { chapters: true } },
        chapters: { select: { wordCount: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Calculate total word count across all books
    let totalWords = 0;
    const booksData = books.map((b) => {
      const bookTotalWords = b.chapters.reduce((sum, ch) => sum + ch.wordCount, 0);
      totalWords += bookTotalWords;
      return {
        id: b.id,
        title: b.title,
        genre: b.genre,
        description: b.description,
        wordGoal: b.wordGoal,
        status: b.status,
        chapterCount: b._count.chapters,
        totalWordCount: bookTotalWords,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({
      books: booksData,
      totalWords,
    });
  } catch (error) {
    console.error('获取书籍列表错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/wordflow/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { title, genre, description, wordGoal } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: '作品标题不能为空' }, { status: 400 });
    }

    const book = await prisma.book.create({
      data: {
        title: title.trim(),
        genre: genre || null,
        description: description || null,
        wordGoal: wordGoal || null,
        userId: userPayload.userId,
      },
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error('创建书籍错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
