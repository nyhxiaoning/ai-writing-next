import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateResetToken, isValidEmail } from '@/lib/auth';
import { sendResetPasswordEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, locale = 'zh' } = await request.json();

    // 验证输入
    if (!email) {
      return NextResponse.json(
        { error: '邮箱不能为空' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // 为了安全，即使用户不存在也返回成功消息
      return NextResponse.json({
        message: '如果该邮箱存在，我们已发送重置密码链接',
      });
    }

    // 生成重置令牌
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时后过期

    // 更新用户的重置令牌
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 发送重置密码邮件
    const emailSent = await sendResetPasswordEmail(email, resetToken, locale);

    if (!emailSent) {
      return NextResponse.json(
        { error: '发送邮件失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '重置密码链接已发送到您的邮箱',
    });
  } catch (error) {
    console.error('重置密码请求错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}