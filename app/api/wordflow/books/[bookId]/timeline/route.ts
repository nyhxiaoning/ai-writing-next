import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const events = await prisma.timelineEvent.findMany({
      where: { bookId: params.bookId, book: { userId: userPayload.userId } },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('获取时间线错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const data = await request.json();
    const event = await prisma.timelineEvent.create({
      data: { ...data, bookId: params.bookId },
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('创建事件错误:', error);
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

    await prisma.timelineEvent.deleteMany({
      where: { id, bookId: params.bookId, book: { userId: userPayload.userId } },
    });
    return NextResponse.json({ message: '已删除' });
  } catch (error) {
    console.error('删除事件错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
