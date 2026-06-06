import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const characters = await prisma.character.findMany({
      where: { bookId: params.bookId, book: { userId: userPayload.userId } },
      include: { faction: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ characters });
  } catch (error) {
    console.error('获取人物列表错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const data = await request.json();
    const character = await prisma.character.create({
      data: { ...data, bookId: params.bookId },
    });
    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    console.error('创建人物错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id, ...data } = await request.json();
    const character = await prisma.character.updateMany({
      where: { id, bookId: params.bookId, book: { userId: userPayload.userId } },
      data,
    });
    return NextResponse.json({ character });
  } catch (error) {
    console.error('更新人物错误:', error);
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

    await prisma.character.deleteMany({
      where: { id, bookId: params.bookId, book: { userId: userPayload.userId } },
    });
    return NextResponse.json({ message: '已删除' });
  } catch (error) {
    console.error('删除人物错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
