import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string; mapId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const data = await request.json();
    const marker = await prisma.mapMarker.create({
      data: { ...data, mapId: params.mapId },
    });
    return NextResponse.json({ marker }, { status: 201 });
  } catch (error) {
    console.error('创建标记错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string; mapId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: '缺少ID' }, { status: 400 });

    await prisma.mapMarker.deleteMany({
      where: { id, mapId: params.mapId },
    });
    return NextResponse.json({ message: '已删除' });
  } catch (error) {
    console.error('删除标记错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
