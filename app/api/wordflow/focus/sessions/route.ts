import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const sessions = await prisma.focusSession.findMany({
      where: { userId: userPayload.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('获取专注会话错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { duration, type, completed, wordCount, notes } = await request.json();
    const session = await prisma.focusSession.create({
      data: {
        duration: duration || 0,
        type: type || 'pomodoro',
        completed: completed || false,
        wordCount: wordCount || null,
        notes: notes || null,
        userId: userPayload.userId,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('创建专注会话错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
