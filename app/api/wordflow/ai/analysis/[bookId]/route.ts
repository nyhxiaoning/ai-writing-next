import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { generateChat } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const aiConfig = await prisma.aiConfig.findUnique({ where: { userId: user.userId } });
    if (!aiConfig) return NextResponse.json({ error: '请先配置 AI API' }, { status: 400 });

    const { chapterId } = await request.json();

    // Get chapter content
    const chapter = await prisma.chapter.findFirst({
      where: { id: chapterId, bookId: params.bookId },
    });
    if (!chapter) return NextResponse.json({ error: '章节不存在' }, { status: 404 });

    // AI analysis prompt
    const prompt = `你是一个专业的网文节奏分析专家。请分析以下小说章节内容，从8个维度进行评分（1-10分），并给出改进建议。

章节标题：${chapter.title}

章节内容：
${chapter.content.slice(0, 8000)}  // 限制长度

请严格按照以下JSON格式回复，不要包含其他文字：
{
  "dimensions": {
    "infoDensity": {"score": 0, "label": "信息密度", "desc": "每段传递的有效信息量"},
    "emotionalIntensity": {"score": 0, "label": "情绪强度", "desc": "情感渲染的力度"},
    "suspense": {"score": 0, "label": "悬念设计", "desc": "钩子和悬念的设置"},
    "conflictTension": {"score": 0, "label": "冲突张力", "desc": "对抗和矛盾的强度"},
    "rhythmSpeed": {"score": 0, "label": "节奏速度", "desc": "叙事推进的快慢"},
    "visualImagery": {"score": 0, "label": "画面感", "desc": "场景描写的画面感"},
    "dialogueQuality": {"score": 0, "label": "对话质量", "desc": "对白的自然度和表现力"},
    "characterPortrayal": {"score": 0, "label": "人物刻画", "desc": "角色塑造的深度"},
  },
  "highlights": ["高潮点1", "高潮点2"],
  "weaknesses": ["低谷/薄弱环节1", "低谷/薄弱环节2"],
  "suggestions": ["改进建议1", "改进建议2", "改进建议3"],
  "summary": "总体评价"
}`;

    const result = await generateChat(
      { apiKey: aiConfig.apiKey, baseUrl: aiConfig.baseUrl || undefined, model: aiConfig.model },
      [{ role: 'user', content: prompt }],
    );

    // Try to parse JSON from AI response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    return NextResponse.json({ analysis, raw: result });
  } catch (e) {
    console.error('节奏分析错误:', e);
    return NextResponse.json({ error: 'AI 分析失败，请稍后重试' }, { status: 500 });
  }
}
