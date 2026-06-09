import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, isValidEmail, hashPassword } from '@/lib/auth';
import { getWhitelistAccount } from '@/lib/whitelist';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码不能为空' },
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
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatar: true,
        emailVerified: true,
      },
    });

    // 检查白名单
    const whitelistAccount = getWhitelistAccount(email);

    let authenticatedUser = user;
    let isPasswordValid = false;

    if (user) {
      // 用户已存在，尝试验证密码
      isPasswordValid = await verifyPassword(password, user.password);

      // 如果密码不匹配，尝试用白名单密码验证
      if (!isPasswordValid && whitelistAccount) {
        isPasswordValid = password === whitelistAccount.password;
        // 如果白名单密码匹配，更新数据库密码
        if (isPasswordValid) {
          const hashedPassword = await hashPassword(password);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          });
        }
      }
    } else if (whitelistAccount) {
      // 用户不存在但在白名单中，自动创建
      isPasswordValid = password === whitelistAccount.password;
      if (isPasswordValid) {
        const hashedPassword = await hashPassword(password);
        authenticatedUser = await prisma.user.create({
          data: {
            email,
            name: whitelistAccount.name || email.split('@')[0],
            password: hashedPassword,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            avatar: true,
            emailVerified: true,
          },
        });
      }
    }

    if (!authenticatedUser || !isPasswordValid) {
      return NextResponse.json(
        { error: '邮箱或密码错误' },
        { status: 401 }
      );
    }

    // 生成 JWT Token
    const tokenPayload = {
      userId: authenticatedUser.id,
      email: authenticatedUser.email,
      name: authenticatedUser.name,
    };

    const token = generateToken(tokenPayload);

    // 设置 Cookie
    const response = NextResponse.json({
      message: '登录成功',
      user: {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        avatar: authenticatedUser.avatar,
        emailVerified: authenticatedUser.emailVerified,
      },
    });

    // 设置认证 Cookie
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7天或1天
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}