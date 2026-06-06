"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * Types
 */
interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * 登录页面
 */
export default function SignIn() {
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("Auth");

  /**
   * Effects
   */
  useEffect(() => {
    // 如果已经登录，重定向到首页
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  /**
   * Events
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // 清除错误信息
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 前端验证
    if (!formData.email || !formData.password) {
      setError(t("fillRequiredFields"));
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t("invalidEmail"));
      return;
    }

    try {
      const success = await login(formData.email, formData.password, formData.rememberMe);

      if (success) {
        // 检查是否有重定向参数
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
      } else {
        setError(t("invalidCredentials"));
      }
    } catch (error) {
      console.error('登录错误:', error);
      setError(t("logginFailedRetry"));
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
              {t("signin")}
            </h1>
            <p className="text-xl text-gray-600">{t("welcomeBack")}</p>
          </div>

          {/* Form */}
          <div className="max-w-sm mx-auto">
            <form onSubmit={handleSubmit}>
              {/* 错误提示 */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}



              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="email"
                  >
                    {t("email")}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder={t("emailPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <div className="flex justify-between">
                    <label
                      className="block text-gray-800 text-sm font-medium mb-1"
                      htmlFor="password"
                    >
                      {t("password")}
                    </label>
                    <Link
                      href={`/${router.locale || 'zh'}/auth/reset-password`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder={t("passwordPlaceholder")}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <div className="flex justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="form-checkbox"
                      />
                      <span className="text-gray-600 ml-2">
                        {t("rememberMe")}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn text-white bg-blue-600 hover:bg-blue-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? t("loggingIn") : t("signin")}
                  </button>
                </div>
              </div>
            </form>

            <div className="text-gray-600 text-center mt-6">
              {t("noAccountYet")}{" "}
              <Link
                href={`/${router.locale || 'zh'}/auth/signup`}
                className="text-blue-600 hover:underline transition duration-150 ease-in-out"
              >
                立即注册
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
