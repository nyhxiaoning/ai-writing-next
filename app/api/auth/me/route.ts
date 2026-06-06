import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);

    if (!userPayload) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // 从数据库获取最新的用户信息
    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}