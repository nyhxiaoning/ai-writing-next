import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET — get user's AI config
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const config = await prisma.aiConfig.findUnique({
      where: { userId: user.userId },
      select: { id: true, provider: true, baseUrl: true, model: true, createdAt: true },
    });

    return NextResponse.json({ config: config || null });
  } catch (e) {
    console.error('获取 AI 配置错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST — save or update AI config
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { provider, apiKey, baseUrl, model } = await request.json();
    if (!apiKey) return NextResponse.json({ error: 'API Key 不能为空' }, { status: 400 });

    const config = await prisma.aiConfig.upsert({
      where: { userId: user.userId },
      update: { provider: provider || 'openai', apiKey, baseUrl: baseUrl || null, model: model || 'gpt-4o' },
      create: { userId: user.userId, provider: provider || 'openai', apiKey, baseUrl: baseUrl || null, model: model || 'gpt-4o' },
    });

    return NextResponse.json({ config: { id: config.id, provider: config.provider, baseUrl: config.baseUrl, model: config.model } });
  } catch (e) {
    console.error('保存 AI 配置错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE — remove AI config
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    await prisma.aiConfig.deleteMany({ where: { userId: user.userId } });
    return NextResponse.json({ message: '已删除' });
  } catch (e) {
    console.error('删除 AI 配置错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
