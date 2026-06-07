import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { streamChat, ChatMessage } from '@/lib/ai';

export const dynamic = 'force-dynamic';

// GET — list chat sessions for current user
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');

    const sessions = await prisma.aiChatSession.findMany({
      where: { userId: user.userId, ...(bookId ? { bookId } : {}) },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: { id: true, title: true, bookId: true, createdAt: true, updatedAt: true, _count: { select: { messages: true } } },
    });

    return NextResponse.json({ sessions });
  } catch (e) {
    console.error('获取聊天会话错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// POST — create session or send message (streaming)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { sessionId, bookId, message } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: '消息不能为空' }, { status: 400 });

    // Get AI config
    const aiConfig = await prisma.aiConfig.findUnique({ where: { userId: user.userId } });
    if (!aiConfig) return NextResponse.json({ error: '请先配置 AI API' }, { status: 400 });

    // Get or create session
    const existingSession = sessionId
      ? await prisma.aiChatSession.findFirst({ where: { id: sessionId, userId: user.userId } })
      : null;
    if (sessionId && !existingSession) return NextResponse.json({ error: '会话不存在' }, { status: 404 });

    const session = existingSession || (await prisma.aiChatSession.create({
        data: {
          title: message.slice(0, 50),
          bookId: bookId || null,
          userId: user.userId,
        },
      }));

    // Save user message
    await prisma.aiChatMessage.create({
      data: { role: 'user', content: message, sessionId: session.id },
    });

    // Build message history (last 20)
    const history = await prisma.aiChatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messages: ChatMessage[] = [
      { role: 'system', content: '你是一个专业的网文创作助手。帮助作者完善小说章节、构思剧情、润色文字。回答要简洁实用，直接给出修改建议或创作内容。' },
      ...history.map((m) => ({ role: m.role as ChatMessage['role'], content: m.content })),
    ];

    // Stream the response via SSE
    const encoder = new TextEncoder();
    let fullContent = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat(
            { apiKey: aiConfig.apiKey, baseUrl: aiConfig.baseUrl || undefined, model: aiConfig.model },
            messages,
          )) {
            fullContent += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
          }

          // Save assistant response
          if (fullContent) {
            await prisma.aiChatMessage.create({
              data: { role: 'assistant', content: fullContent, sessionId: session.id },
            });
            // Update session timestamp
            await prisma.aiChatSession.update({ where: { id: session.id }, data: { updatedAt: new Date() } });
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: session.id })}\n\n`));
          controller.close();
        } catch (err: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message || 'AI 响应失败' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e) {
    console.error('AI 聊天错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// DELETE — delete a chat session and all its messages
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: '未授权' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: '缺少会话 ID' }, { status: 400 });

    await prisma.aiChatSession.deleteMany({
      where: { id, userId: user.userId },
    });

    return NextResponse.json({ message: '已删除' });
  } catch (e) {
    console.error('删除会话错误:', e);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
