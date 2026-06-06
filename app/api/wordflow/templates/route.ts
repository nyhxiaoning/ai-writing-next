import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const type = searchParams.get('type');

    const where: any = {};
    if (genre) where.genre = genre;
    if (type) where.type = type;

    const templates = await prisma.template.findMany({
      where,
      orderBy: { usageCount: 'desc' },
      take: 50,
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('获取模板错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
