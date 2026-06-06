import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/wordflow/books/[bookId]/sync/sync-pull - Pull from GitHub and merge
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

    // Fetch from GitHub
    const githubApiUrl = `https://api.github.com/repos/${config.githubOwner}/${config.githubRepo}/contents/${config.githubPath}`;
    const getRes = await fetch(githubApiUrl, {
      headers: {
        Authorization: `Bearer ${config.githubToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!getRes.ok) {
      if (getRes.status === 404) {
        return NextResponse.json({ error: '远程文件不存在，请先推送' }, { status: 404 });
      }
      return NextResponse.json({ error: `GitHub 拉取失败: ${getRes.statusText}` }, { status: 502 });
    }

    const fileData = await getRes.json();
    const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const remote: {
      book: { title: string; genre?: string; description?: string; wordGoal?: number; status: string };
      chapters?: Array<{ title: string; content: string; wordCount: number; sortOrder: number; status: string }>;
    } = JSON.parse(decodedContent);

    // Verify book ownership
    const localBook = await prisma.book.findFirst({
      where: { id: params.bookId, userId: userPayload.userId },
    });

    if (!localBook) {
      return NextResponse.json({ error: '作品不存在' }, { status: 404 });
    }

    // Update book metadata from remote
    await prisma.book.update({
      where: { id: params.bookId },
      data: {
        title: remote.book.title,
        ...(remote.book.genre !== undefined && { genre: remote.book.genre }),
        ...(remote.book.description !== undefined && { description: remote.book.description }),
        ...(remote.book.wordGoal !== undefined && { wordGoal: remote.book.wordGoal }),
        ...(remote.book.status !== undefined && { status: remote.book.status }),
      },
    });

    // Merge chapters: update existing by sortOrder, create new ones
    let importedChapters = 0;
    let updatedChapters = 0;

    if (remote.chapters && remote.chapters.length > 0) {
      // Get existing chapters indexed by sortOrder for matching
      const existingChapters = await prisma.chapter.findMany({
        where: { bookId: params.bookId },
        select: { id: true, sortOrder: true },
      });
      const existingByOrder = new Map(existingChapters.map((c) => [c.sortOrder, c.id]));

      for (let i = 0; i < remote.chapters.length; i++) {
        const rc = remote.chapters[i];
        const existingId = existingByOrder.get(i);

        if (existingId) {
          // Update existing chapter
          await prisma.chapter.update({
            where: { id: existingId },
            data: {
              title: rc.title,
              content: rc.content,
              wordCount: rc.wordCount,
              status: rc.status,
            },
          });
          updatedChapters++;
        } else {
          // Create new chapter
          await prisma.chapter.create({
            data: {
              title: rc.title,
              content: rc.content,
              wordCount: rc.wordCount,
              sortOrder: i,
              status: rc.status,
              bookId: params.bookId,
            },
          });
          importedChapters++;
        }
      }
    }

    // Update lastSyncedAt
    await prisma.bookSyncConfig.update({
      where: { id: config.id },
      data: { lastSyncedAt: new Date() },
    });

    return NextResponse.json({
      message: '拉取成功',
      syncedAt: new Date().toISOString(),
      stats: {
        updated: updatedChapters,
        imported: importedChapters,
      },
    });
  } catch (error) {
    console.error('拉取错误:', error);
    return NextResponse.json({ error: '拉取失败，请稍后重试' }, { status: 500 });
  }
}
