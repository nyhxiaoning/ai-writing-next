import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, generateToken, isValidEmail, isValidPassword } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, confirmPassword, locale = 'zh' } = await request.json();

    // 验证输入
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: '密码至少8位，包含字母和数字' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: '两次输入的密码不一致' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // 生成 JWT Token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };

    const token = generateToken(tokenPayload);

    // 发送欢迎邮件（异步，不阻塞响应）
    sendWelcomeEmail(email, name, locale).catch(error => {
      console.error('发送欢迎邮件失败:', error);
    });

    // 设置 Cookie 并返回响应
    const response = NextResponse.json({
      message: '注册成功',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 1天
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}