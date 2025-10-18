import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 从请求头获取语言信息
  const acceptLanguage = request.headers.get('accept-language') || 'zh';
  const locale = acceptLanguage.split(',')[0].split('-')[0];

  // 根据语言返回不同的响应
  const messages = {
    zh: {
      message: '你好，这是一个国际化的 API 响应',
      timestamp: new Date().toLocaleString('zh-CN'),
    },
    en: {
      message: 'Hello, this is an internationalized API response',
      timestamp: new Date().toLocaleString('en-US'),
    },
    ja: {
      message: 'こんにちは、これは国際化されたAPIレスポンスです',
      timestamp: new Date().toLocaleString('ja-JP'),
    },
  };

  const response = messages[locale as keyof typeof messages] || messages.zh;

  return NextResponse.json({
    success: true,
    locale,
    data: response,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale = 'zh', name } = body;

    const greetings = {
      zh: `你好，${name}！欢迎使用我们的国际化服务。`,
      en: `Hello, ${name}! Welcome to our internationalized service.`,
      ja: `こんにちは、${name}さん！私たちの国際化サービスへようこそ。`,
    };

    const greeting = greetings[locale as keyof typeof greetings] || greetings.zh;

    return NextResponse.json({
      success: true,
      locale,
      greeting,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}