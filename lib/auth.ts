import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { isGuestAllowed } from './whitelist';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * 密码加密
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * 密码验证
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * 生成 JWT Token
 */
export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * 从请求中获取用户信息
 * 如果请求在白名单内且为 GET 方法，返回访客用户信息
 */
export function getUserFromRequest(request: NextRequest): any {
  const token = request.cookies.get('auth-token')?.value;

  if (token) {
    const payload = verifyToken(token);
    if (payload) return payload;
  }

  // 检查白名单：允许访客以只读模式访问
  if (isGuestAllowed(request.nextUrl.pathname, request.method)) {
    return { userId: -1, isGuest: true };
  }

  return null;
}

/**
 * 生成重置密码令牌
 */
export function generateResetToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证密码强度
 */
export function isValidPassword(password: string): boolean {
  // 至少8位，包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}