"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
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
  const pathname = usePathname();
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
      setError(t("emailRequired"));
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("invalidEmail"));
      return;
    }

    try {
      const result = await requestPasswordReset(email, pathname.split('/')[1] || 'zh');
      
      if (result.success) {
        setSuccess(t("resetEmailSent"));
        setEmail(""); // 清空表单
      } else {
        setError(result.error || t("resetFailed"));
      }
    } catch (error) {
      console.error('请求重置密码错误:', error);
      setError(t("resetFailed"));
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError(t("fillAllFields"));
      return;
    }

    // 密码强度验证
    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError(t("passwordRequirement"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    try {
      const result = await confirmPasswordReset(token!, password, confirmPassword);
      
      if (result.success) {
        setSuccess(t("resetSuccessRedirect"));
        setTimeout(() => {
          router.push(`/${pathname?.split("/")[1] || "zh"}/auth/signin`);
        }, 2000);
      } else {
        setError(result.error || t("resetFailed"));
      }
    } catch (error) {
      console.error('确认重置密码错误:', error);
      setError(t("resetFailed"));
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
              {isConfirmMode ? t("setNewPassword") : t("resetPassword")}
            </h1>
            <p className="text-xl text-gray-600">
              {isConfirmMode 
                ? t("enterNewPassword") 
                : t("sendResetEmailDesc")
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
                      {t("newPassword")} *
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder={t("passwordPlaceholderHint")}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {t("passwordHint")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap -mx-3 mb-4">
                  <div className="w-full px-3">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="confirmPassword"
                    >
                      {t("confirmNewPassword")} *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                      placeholder={t("reEnterNewPassword")}
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
                      {isLoading ? t("resetting") : t("resetPassword")}
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
                      placeholder={t("emailPlaceholder")}
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
                      {isLoading ? t("sendingEmail") : t("sendResetLink")}
                    </button>
                  </div>
                </div>
              </form>
            )}

            <div className="text-gray-600 text-center mt-6">
              {t("rememberPassword")}{" "}
              <Link
                href={`/${pathname?.split("/")[1] || "zh"}/auth/signin`}
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