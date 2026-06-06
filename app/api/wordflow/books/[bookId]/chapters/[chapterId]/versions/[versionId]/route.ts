import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// DELETE - delete a version
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookId: string; chapterId: string; versionId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: params.chapterId },
      include: { book: { select: { userId: true } } },
    });

    if (!chapter || chapter.book.userId !== userPayload.userId) {
      return NextResponse.json({ error: '章节不存在' }, { status: 404 });
    }

    await prisma.chapterVersion.delete({
      where: { id: params.versionId },
    });

    return NextResponse.json({ message: '版本已删除' });
  } catch (error) {
    console.error('删除版本错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST - restore a version (copy version content back to chapter)
export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string; chapterId: string; versionId: string } }
) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findFirst({
      where: { id: params.chapterId },
      include: { book: { select: { userId: true } } },
    });

    if (!chapter || chapter.book.userId !== userPayload.userId) {
      return NextResponse.json({ error: '章节不存在' }, { status: 404 });
    }

    const version = await prisma.chapterVersion.findUnique({
      where: { id: params.versionId },
    });

    if (!version) {
      return NextResponse.json({ error: '版本不存在' }, { status: 404 });
    }

    // Save current content as a version before restoring
    await prisma.chapterVersion.create({
      data: {
        content: chapter.content,
        wordCount: chapter.wordCount,
        note: '恢复前自动保存',
        chapterId: params.chapterId,
      },
    });

    // Restore version content
    const updated = await prisma.chapter.update({
      where: { id: params.chapterId },
      data: {
        content: version.content,
        wordCount: version.wordCount,
      },
    });

    return NextResponse.json({ chapter: updated });
  } catch (error) {
    console.error('恢复版本错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
