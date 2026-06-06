import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/wordflow/books/[bookId]/sync - Get sync config
export async function GET(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const config = await prisma.bookSyncConfig.findFirst({
      where: { bookId: params.bookId, userId: userPayload.userId },
    });

    if (!config) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({
      config: {
        id: config.id,
        githubOwner: config.githubOwner,
        githubRepo: config.githubRepo,
        githubPath: config.githubPath,
        lastSyncedAt: config.lastSyncedAt?.toISOString() || null,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('获取同步配置错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/wordflow/books/[bookId]/sync - Save sync config
export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { githubOwner, githubRepo, githubPath, githubToken } = await request.json();

    if (!githubOwner || !githubRepo || !githubPath || !githubToken) {
      return NextResponse.json({ error: '请填写所有必填项' }, { status: 400 });
    }

    // Verify book ownership
    const book = await prisma.book.findFirst({
      where: { id: params.bookId, userId: userPayload.userId },
    });
    if (!book) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    const config = await prisma.bookSyncConfig.upsert({
      where: { bookId: params.bookId },
      update: {
        githubOwner,
        githubRepo,
        githubPath,
        githubToken,
        userId: userPayload.userId,
      },
      create: {
        bookId: params.bookId,
        userId: userPayload.userId,
        githubOwner,
        githubRepo,
        githubPath,
        githubToken,
      },
    });

    return NextResponse.json({
      config: {
        id: config.id,
        githubOwner: config.githubOwner,
        githubRepo: config.githubRepo,
        githubPath: config.githubPath,
        lastSyncedAt: config.lastSyncedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('保存同步配置错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// DELETE /api/wordflow/books/[bookId]/sync - Clear sync config
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const config = await prisma.bookSyncConfig.findFirst({
      where: { bookId: params.bookId, userId: userPayload.userId },
    });

    if (!config) {
      return NextResponse.json({ error: '同步配置不存在' }, { status: 404 });
    }

    await prisma.bookSyncConfig.delete({ where: { id: config.id } });

    return NextResponse.json({ message: '同步配置已清除' });
  } catch (error) {
    console.error('清除同步配置错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
