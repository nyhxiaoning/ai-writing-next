import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/wordflow/books/[bookId]/sync/sync-now - Perform sync to GitHub
export async function POST(
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
      return NextResponse.json({ error: '请先配置同步' }, { status: 400 });
    }

    // Fetch all chapters for this book to build the export data
    const book = await prisma.book.findFirst({
      where: { id: params.bookId, userId: userPayload.userId },
      include: {
        chapters: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            content: true,
            wordCount: true,
            sortOrder: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    // Build export payload
    const exportData = {
      book: {
        id: book.id,
        title: book.title,
        genre: book.genre,
        description: book.description,
        wordGoal: book.wordGoal,
        status: book.status,
        createdAt: book.createdAt.toISOString(),
        updatedAt: book.updatedAt.toISOString(),
      },
      chapters: book.chapters,
      exportedAt: new Date().toISOString(),
    };

    // Push to GitHub via raw fetch
    const content = Buffer.from(JSON.stringify(exportData, null, 2)).toString('base64');
    const githubApiUrl = `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/contents/${config.githubPath}`;

    // First, try to get existing file (to get sha for update)
    let sha: string | undefined;
    try {
      const getRes = await fetch(githubApiUrl, {
        headers: {
          Authorization: `Bearer ${config.githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (getRes.ok) {
        const existing = await getRes.json();
        sha = existing.sha;
      }
    } catch {
      // File doesn't exist yet, will create
    }

    const putRes = await fetch(githubApiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `同步作品: ${book.title} - ${new Date().toLocaleString('zh-CN')}`,
        content,
        sha,
      }),
    });

    if (!putRes.ok) {
      const errBody = await putRes.text();
      console.error('GitHub API error:', putRes.status, errBody);
      return NextResponse.json({
        error: `GitHub 同步失败: ${putRes.statusText}`,
      }, { status: 502 });
    }

    // Update lastSyncedAt
    await prisma.bookSyncConfig.update({
      where: { id: config.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({
      message: '同步成功',
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('同步错误:', error);
    return NextResponse.json({ error: '同步失败，请稍后重试' }, { status: 500 });
  }
}
