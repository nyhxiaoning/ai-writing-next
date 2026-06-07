import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/wordflow/templates - List templates
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
      orderBy: [{ isOfficial: 'desc' }, { usageCount: 'desc' }],
      take: 50,
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('获取模板错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST /api/wordflow/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { name, description, genre, type, content } = await request.json();
    if (!name?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '名称和内容不能为空' }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        name: name.trim(),
        description: description || null,
        genre: genre || null,
        type: type || 'outline',
        content,
        userId: userPayload.userId,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('创建模板错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT /api/wordflow/templates - Update a template
export async function PUT(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { id, name, description, genre, type, content } = await request.json();
    if (!id) {
      return NextResponse.json({ error: '缺少模板 ID' }, { status: 400 });
    }

    const existing = await prisma.template.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '模板不存在' }, { status: 404 });
    }

    // Allow edit if user owns it or it's an official template
    if (!existing.isOfficial && existing.userId !== userPayload.userId) {
      return NextResponse.json({ error: '无权编辑此模板' }, { status: 403 });
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description || null }),
        ...(genre !== undefined && { genre: genre || null }),
        ...(type !== undefined && { type }),
        ...(content !== undefined && { content }),
      },
    });

    return NextResponse.json({ template });
  } catch (error) {
    console.error('更新模板错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
