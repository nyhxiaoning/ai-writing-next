import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { generateChat } from '@/lib/ai';

// ─── System prompts ────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<string, string> = {
  nameGenerator: `你是一位专业的网文创作命名顾问。你的任务是：
1. 分析用户提供的命名需求（风格、类型、关键词）
2. 如果用户请求"推导"，分析现有命名风格并给出命名建议
3. 如果用户请求"生成"，根据推导结果或直接需求生成高质量的名称

命名要求：
- 每个名称要有独特的风格和含义
- 符合角色/地点/物品的设定氛围
- 避免过于常见或俗套的名字
- 可以配合说明名字的寓意或来源
- 输出时按编号排列，每个名称换行`,

  plotSuggestion: `你是一位经验丰富的网文剧情架构师。你的任务是：
1. 分析用户当前的剧情困境和写作目标
2. 如果用户请求"推导"，分析现有剧情结构、角色弧光、未解决的冲突
3. 如果用户请求"生成"，提供具体可执行的剧情建议

要求：
- 建议要具体，不能泛泛而谈
- 考虑前后文的逻辑连贯性
- 提供2-3个不同的发展方向供选择
- 每个方向说明优缺点
- 可以结合网文常见套路但要有新意`,

  descriptionExpander: `你是一位擅长场景描写的文学编辑。你的任务是：
1. 分析用户提供的简短描述
2. 如果用户请求"推导"，分析可以从哪些感官维度进行扩写
3. 如果用户请求"生成"，将简短描述扩写为丰富动人的段落

扩写要求：
- 调动多感官描写（视觉、听觉、嗅觉、触觉、情绪）
- 保持与原文一致的风格和基调
- 适当加入比喻和拟人等修辞手法
- 注意节奏感——长短句结合
- 不要过度堆砌辞藻，保持自然流畅`,

  summaryGenerator: `你是一位专业的小说内容分析师。你的任务是：
1. 分析用户提供的章节内容或大纲
2. 如果用户请求"推导"，识别关键情节点、角色弧光、伏笔设置
3. 如果用户请求"生成"，输出结构化的章节摘要

要求：
- 摘要要简洁有力，保留核心信息
- 标注关键情节节点
- 指出重要的伏笔和悬念
- 评估节奏和情感曲线
- 如有建议改进之处可以附注`,

  scriptReviewer: `你是一位专业的剧本审阅编辑。你的核心职责是审阅和分析剧本内容，然后根据用户选择的优化方向进行内容优化。

## 审阅维度
审阅时必须从以下三个维度进行分析：

### 1. 角色一致性
- 角色的言行是否符合其性格设定
- 角色在不同场景中的表现是否一致
- 角色的情感反应是否合理
- 角色的成长弧光是否连贯

### 2. 对话连贯性
- 对话是否符合角色身份和关系
- 对话之间的逻辑衔接是否自然
- 对话是否推动剧情发展
- 话题转换是否合理

### 3. 对话趣味性
- 对话是否有吸引力和张力
- 是否有出人意料的反转或妙语
- 幽默或情感元素是否自然融入
- 节奏是否有变化，避免单调

## 审阅报告格式
每个维度的分析请按以下格式输出：
【维度名称】
- 评分：[1-10]/10
- 优点：[列出2-3个优点]
- 问题：[列出2-3个具体问题，引用原文]
- 建议：[给出2-3条具体改进建议]

最后给出总体评价和建议优先级。`,
};

// ─── Script reviewer special instructions ──────────────────────────

const REVIEW_INSTRUCTION = `
请对用户提供的剧本内容进行审阅分析。
严格按照以下三个维度进行审阅：
1. 角色一致性
2. 对话连贯性
3. 对话趣味性

每个维度请给出评分、优点、具体问题和改进建议。
最后给出总体评价和改进优先级。`;

const OPTIMIZE_INSTRUCTION = `
用户已经查阅了你的审阅报告，现在选择了特定的优化方向。
请根据用户选择的优化方向，对原文进行改写优化。

优化要求：
- 仅修改与所选优化方向相关的内容，保持其他部分不变
- 保持原文的核心情节和人物设定不变
- 在修改处用【优化】标记标注
- 输出完整优化后的内容
- 在末尾附上修改说明，列出具体改了哪些地方

用户选择的优化方向：{directions}
审阅报告摘要：{reviewSummary}
{targetWordCount}`;

// ─── Derive prompts ────────────────────────────────────────────────

const DERIVE_INSTRUCTION = `
在生成之前，请先进行推导分析。推导内容包括：
- 分析用户输入的核心需求
- 评估现有素材的特点和可用信息
- 指出需要注意的关键点
- 给出2-3条具体的创作建议
- 推荐最佳的输出方向

请以"【推导分析】"为开头，结构清晰，每条建议独占一行。`;

const GENERATE_INSTRUCTION = `
请根据用户的需求直接生成内容。
参考之前的推导分析（如有），输出高质量的结果。
内容要具体、实用、可直接使用。`;

// ─── Handler ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }

    const { tool, action, params, context } = await request.json();
    const { prompt, ...restParams } = params || {};

    if (!tool || !action || !prompt?.trim()) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // Get user's AI config
    const aiConfig = await prisma.aiConfig.findFirst({
      where: { userId: userPayload.userId },
    });

    if (!aiConfig) {
      return NextResponse.json({ error: '请先在 AI 聊天中配置 API 密钥' }, { status: 400 });
    }

    // Build system prompt
    const basePrompt = SYSTEM_PROMPTS[tool];
    if (!basePrompt) {
      return NextResponse.json({ error: '未知工具类型' }, { status: 400 });
    }

    // Special handling for scriptReviewer
    let instruction: string;
    if (tool === 'scriptReviewer') {
      if (action === 'derive') {
        instruction = REVIEW_INSTRUCTION;
      } else {
        // generate — pass selected directions and review summary
        const directions = restParams.directions || '未指定';
        const reviewSummary = restParams.reviewSummary || '无审阅摘要';
        const targetWordCount = restParams.targetWordCount
          ? `目标字数：优化后的内容控制在 ${restParams.targetWordCount} 字左右。`
          : '';
        instruction = OPTIMIZE_INSTRUCTION
          .replace('{directions}', directions as string)
          .replace('{reviewSummary}', reviewSummary as string)
          .replace('{targetWordCount}', targetWordCount as string);
      }
    } else {
      instruction = action === 'derive' ? DERIVE_INSTRUCTION : GENERATE_INSTRUCTION;
    }

    const contextBlock = context
      ? `\n\n当前作品的上下文信息：\n${Object.entries(context)
          .filter(([_, v]) => v)
          .map(([k, v]) => `${k}：${v}`)
          .join('\n')}`
      : '';

    const paramsBlock = Object.entries(restParams)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}：${v}`)
      .join('\n');

    const userMessage = [
      prompt && `用户输入：${prompt}`,
      paramsBlock && `\n附加参数：\n${paramsBlock}`,
      contextBlock,
      instruction,
    ]
      .filter(Boolean)
      .join('\n');

    const result = await generateChat(
      {
        apiKey: aiConfig.apiKey,
        baseUrl: aiConfig.baseUrl || undefined,
        model: aiConfig.model || undefined,
      },
      [
        { role: 'system', content: basePrompt },
        { role: 'user', content: userMessage },
      ],
    );

    return NextResponse.json({ result });
  } catch (error) {
    console.error('AI 工具请求失败:', error);
    return NextResponse.json({ error: 'AI 请求失败，请检查配置或稍后重试' }, { status: 500 });
  }
}
