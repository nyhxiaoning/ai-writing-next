import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: { params: { bookId: string } }) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

    const { searchText, replaceText, caseSensitive, useRegex } = await request.json();
    if (!searchText) return NextResponse.json({ error: '搜索文本不能为空' }, { status: 400 });

    const chapters = await prisma.chapter.findMany({
      where: { bookId: params.bookId, book: { userId: userPayload.userId } },
      select: { id: true, title: true, content: true },
    });

    let totalMatches = 0;
    let totalReplaced = 0;
    const affectedChapters: string[] = [];

    for (const chapter of chapters) {
      let content = chapter.content;
      let matchCount = 0;

      if (useRegex) {
        try {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(searchText, flags);
          const matches = content.match(regex);
          matchCount = matches?.length || 0;
          if (matchCount > 0) {
            content = content.replace(regex, replaceText);
          }
        } catch {
          return NextResponse.json({ error: '无效的正则表达式' }, { status: 400 });
        }
      } else {
        const search = caseSensitive ? searchText : searchText.toLowerCase();
        const compareContent = caseSensitive ? content : content.toLowerCase();
        let pos = 0;
        while ((pos = compareContent.indexOf(search, pos)) !== -1) {
          matchCount++;
          pos += search.length;
        }
        if (matchCount > 0) {
          content = content.split(searchText).join(replaceText);
        }
      }

      if (matchCount > 0) {
        totalMatches += matchCount;
        totalReplaced += matchCount;
        affectedChapters.push(chapter.id);
        await prisma.chapter.update({
          where: { id: chapter.id },
          data: { content },
        });
      }
    }

    // Log the operation
    await prisma.batchReplaceRecord.create({
      data: {
        searchText,
        replaceText,
        scope: 'book',
        caseSensitive,
        useRegex,
        matches: totalMatches,
        replaced: totalReplaced,
        affectedChapters: JSON.stringify(affectedChapters),
        bookId: params.bookId,
        userId: userPayload.userId,
      },
    });

    return NextResponse.json({
      matches: totalMatches,
      replaced: totalReplaced,
      affectedChapters: affectedChapters.length,
    });
  } catch (error) {
    console.error('批量替换错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
