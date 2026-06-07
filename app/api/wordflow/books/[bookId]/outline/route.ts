import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    // Get top-level nodes with their children (2 levels)
    const nodes = await prisma.outlineNode.findMany({
      where: { bookId: params.bookId, book: { userId: userPayload.userId }, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          orderBy: { sortOrder: 'asc' },
          include: {
            children: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    return NextResponse.json({ nodes });
  } catch (error) {
    console.error('获取大纲错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const data = await request.json();
    const node = await prisma.outlineNode.create({
      data: {
        title: data.title || '新节点',
        content: data.content || null,
        sortOrder: data.sortOrder || 0,
        depth: data.depth || 0,
        nodeType: data.nodeType || null,
        parentId: data.parentId || null,
        bookId: params.bookId,
      },
    });

    return NextResponse.json({ node }, { status: 201 });
  } catch (error) {
    console.error('创建大纲节点错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id, title, content, nodeType } = await request.json();
    if (!id) return NextResponse.json({ error: '缺少 ID' }, { status: 400 });

    const updated = await prisma.outlineNode.updateMany({
      where: { id, bookId: params.bookId, book: { userId: userPayload.userId } },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(nodeType !== undefined && { nodeType }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('更新大纲节点错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 });

    await prisma.outlineNode.deleteMany({
      where: { id, bookId: params.bookId, book: { userId: userPayload.userId } },
    });

    return NextResponse.json({ message: '已删除' });
  } catch (error) {
    console.error('删除大纲节点错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
