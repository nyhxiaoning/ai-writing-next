import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const equipment = await prisma.equipment.findMany({
      where: { bookId: params.bookId, book: { userId: userPayload.userId } },
      include: { owner: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ equipment });
  } catch (error) {
    console.error('获取装备列表错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const data = await request.json();
    const item = await prisma.equipment.create({
      data: { ...data, bookId: params.bookId },
    });
    return NextResponse.json({ equipment: item }, { status: 201 });
  } catch (error) {
    console.error('创建装备错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { id, ...data } = await request.json();
    await prisma.equipment.updateMany({
      where: { id, bookId: params.bookId, book: { userId: userPayload.userId } },
      data,
    });
    return NextResponse.json({ message: '已更新' });
  } catch (error) {
    console.error('更新装备错误:', error);
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

    await prisma.equipment.deleteMany({
      where: { id, bookId: params.bookId, book: { userId: userPayload.userId } },
    });
    return NextResponse.json({ message: '已删除' });
  } catch (error) {
    console.error('删除装备错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
