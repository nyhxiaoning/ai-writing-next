"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * 重置密码页面
 */
export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { requestPasswordReset, confirmPasswordReset, isLoading } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const t = useTranslations("Auth");

  // 判断是请求重置还是确认重置
  const isConfirmMode = !!token;

  /**
   * Events
   */
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("请输入邮箱地址");
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("请输入有效的邮箱地址");
      return;
    }

    try {
      const result = await requestPasswordReset(email, router.locale || 'zh');
      
      if (result.success) {
        setSuccess("重置密码链接已发送到您的邮箱，请查收");
        setEmail(""); // 清空表单
      } else {
        setError(result.error || "发送失败，请稍后重试");
      }
    } catch (error) {
      console.error('请求重置密码错误:', error);
      setError("发送失败，请稍后重试");
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("请填写所有字段");
      return;
    }

    // 密码强度验证
    if (password.length < 8) {
      setError("密码至少需要8个字符");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("密码必须包含至少一个字母和一个数字");
      return;
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    try {
      const result = await confirmPasswordReset(token!, password, confirmPassword);
      
      if (result.success) {
        setSuccess("密码重置成功！正在跳转到登录页面...");
        setTimeout(() => {
          router.push(`/${router.locale || 'zh'}/auth/signin`);
        }, 2000);
      } else {
        setError(result.error || "重置失败，请稍后重试");
      }
    } catch (error) {
      console.error('确认重置密码错误:', error);
      setError("重置失败，请稍后重试");
    }
  };

  /**
   * JSXComponents
   */
  return (
    <section className="bg-gradient-to-b from-gray-100 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Page header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {isConfirmMode ? "设置新密码" : "重置密码"}
            </h1>
            <p className="text-xl text-gray-600">
              {isConfirmMode 
                ? "请输入您的新密码" 
                : "输入您的邮箱地址，我们将发送重置链接给您"
              }
            </p>
          </div>

          {/* Form */}
          <div className="max-w-sm mx-auto">
            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            {isConfirmMode ? (
              // 确认重置密码表单
              <form onSubmit={handleConfirmReset}>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="password"
                    >
                      新密码 *
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="至少8位，包含字母和数字"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      密码必须至少8位，包含字母和数字
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="confirmPassword"
                    >
                      确认新密码 *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="请再次输入新密码"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap -mx-3 mt-6">
                  <div className="w-full px-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn text-white bg-blue-600 hover:bg-blue-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "重置中..." : "重置密码"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              // 请求重置密码表单
              <form onSubmit={handleRequestReset}>
                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="email"
                    >
                      {t("email")} *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="请输入您的邮箱地址"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap -mx-3 mt-6">
                  <div className="w-full px-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn text-white bg-blue-600 hover:bg-blue-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "发送中..." : "发送重置链接"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="text-gray-600 text-center mt-6">
              记起密码了？{" "}
              <Link
                href={`/${router.locale || 'zh'}/auth/signin`}
                className="text-blue-600 hover:underline transition duration-150 ease-in-out"
              >
                {t("signin")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}