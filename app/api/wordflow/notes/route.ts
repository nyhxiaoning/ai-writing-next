import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET — list notes for a book
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const category = searchParams.get('category');

    const where: any = { userId: user.userId };
    if (bookId) where.bookId = bookId;
    if (category) where.category = category;

    const notes = await prisma.note.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ notes });
  } catch (e) {
    console.error('获取笔记错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST — create a note
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { bookId, title, content, category, color } = await request.json();
    if (!bookId || !title) return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });

    const note = await prisma.note.create({
      data: {
        title,
        content: content || '',
        category: category || 'suspense',
        color: color || null,
        bookId,
        userId: user.userId,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (e) {
    console.error('创建笔记错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PUT — update a note
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { id, title, content, category } = await request.json();
    if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });

    await prisma.note.updateMany({
      where: { id, userId: user.userId },
      data: { ...(title !== undefined && { title }), ...(content !== undefined && { content }), ...(category !== undefined && { category }) },
    });

    return NextResponse.json({ message: '已更新' });
  } catch (e) {
    console.error('更新笔记错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE — delete a note
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });

    await prisma.note.deleteMany({ where: { id, userId: user.userId } });
    return NextResponse.json({ message: '已删除' });
  } catch (e) {
    console.error('删除笔记错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
