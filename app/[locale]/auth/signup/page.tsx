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
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * 注册页面
 */
export default function SignUp() {
  const { register, isLoading, isAuthenticated } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 清除错误信息
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = (): boolean => {
    // 检查必填字段
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError(t("fillRequiredFields"));
      return false;
    }

    // 姓名验证
    if (formData.name.length < 2) {
      setError(t("nameTooShort"));
      return false;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t("invalidEmail"));
      return false;
    }

    // 密码强度验证
    if (formData.password.length < 8) {
      setError(t("passwordTooShort"));
      return false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(t("passwordRequirement"));
      return false;
    }

    // 确认密码验证
    if (formData.password !== formData.confirmPassword) {
      setError(t("passwordMismatch"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword,
        router.locale || 'zh'
      );

      if (result.success) {
        setSuccess(t("signupSuccessRedirect"));
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error || t("signupFailedRetry"));
      }
    } catch (error) {
      console.error('注册错误:', error);
      setError(t("signupFailedRetry"));
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
              {t("signup")}
            </h1>
            <p className="text-xl text-gray-600">{t("createAccount")}</p>
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

              {/* 成功提示 */}
              {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {success}
                </div>
              )}

              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="name"
                  >
                    {t("name")} *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder={t("namePlaceholder")}
                    required
                  />
                </div>
              </div>

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
                  <label
                    className="block text-gray-800 text-sm font-medium mb-1"
                    htmlFor="password"
                  >
                    {t("password")} *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
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
                    {t("confirmPassword")} *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder={t("confirmPasswordPlaceholder")}
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
                    {isLoading ? t("signingUp") : t("signup")}
                  </button>
                </div>
              </div>
            </form>

            <div className="text-gray-600 text-center mt-6">
              {t("hasAccount")}{" "}
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