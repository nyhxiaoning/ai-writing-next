import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { generateChat } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const aiConfig = await prisma.aiConfig.findUnique({ where: { userId: user.userId } });
    if (!aiConfig) return NextResponse.json({ error: '请先配置 AI API' }, { status: 400 });

    const { originalContent, requirements } = await request.json();
    if (!originalContent?.trim()) return NextResponse.json({ error: '原内容不能为空' }, { status: 400 });

    // Build rewrite prompt from requirements table
    const req = requirements || {};
    const prompt = `你是一个专业的网文改写助手。请根据以下要求对原文进行改写。

## 改写要求
${req.hasDialogue ? `- 对话对白：${req.hasDialogue}` : ''}
${req.personification ? `- 角色拟人化程度：${req.personification}` : ''}
${req.narrativeStyle ? `- 叙事风格：${req.narrativeStyle}` : ''}
${req.sceneType ? `- 场景分类：${req.sceneType}` : ''}
${req.emotionalTone ? `- 情感基调：${req.emotionalTone}` : ''}
${req.otherRequirements ? `- 其他要求：${req.otherRequirements}` : ''}
${req.targetWordCount ? `- 目标字数：${req.targetWordCount} 字` : ''}

## 原文
${originalContent.slice(0, 6000)}

请直接输出改写后的内容，不要包含分析或说明。`;

    const result = await generateChat(
      { apiKey: aiConfig.apiKey, baseUrl: aiConfig.baseUrl || undefined, model: aiConfig.model },
      [{ role: 'user', content: prompt }],
    );

    return NextResponse.json({ rewritten: result });
  } catch (e) {
    console.error('AI 改写错误:', e);
    return NextResponse.json({ error: 'AI 改写失败，请稍后重试' }, { status: 500 });
  }
}
