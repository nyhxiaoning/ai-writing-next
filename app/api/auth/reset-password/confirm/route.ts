import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword, isValidPassword } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();

    // 验证输入
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: '所有字段都是必填的' },
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

    // 查找用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(), // 令牌未过期
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '重置令牌无效或已过期' },
        { status: 400 }
      );
    }

    // 加密新密码
    const hashedPassword = await hashPassword(password);

    // 更新用户密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: '密码重置成功',
    });
  } catch (error) {
    console.error('确认重置密码错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}