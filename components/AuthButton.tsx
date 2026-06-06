"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

/**
 * Types
 */
interface AuthButtonProps {
  className?: string;
}

/**
 * 认证按钮组件
 */
const AuthButton: React.FC<AuthButtonProps> = ({ className = '' }) => {
  const { user, isAuthenticated, logout, checkAuth, isLoading } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('Auth');

  /**
   * Effects
   */
  useEffect(() => {
    // 组件挂载时检查认证状态
    checkAuth();
  }, [checkAuth]);

  // 获取当前语言
  const getCurrentLocale = () => {
    const segments = pathname.split('/');
    const locale = segments[1];
    return ['zh', 'en', 'ja'].includes(locale) ? locale : 'zh';
  };

  /**
   * Events
   */
  const handleLogin = () => {
    const locale = getCurrentLocale();
    router.push(`/${locale}/auth/signin`);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    const locale = getCurrentLocale();
    router.push(`/${locale}`);
  };

  const handleProfile = () => {
    const locale = getCurrentLocale();
    router.push(`/${locale}/dashboard`);
    setIsDropdownOpen(false);
  };

  /**
   * JSXComponents
   */
  // 加载状态
  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse px-4 py-2 rounded-lg ${className}`}>
        <div className="w-16 h-6 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={handleLogin}
        className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 ${className}`}
      >
        {t("signin")}
      </button>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors duration-200"
      >
        {user?.avatar && (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-gray-700 font-medium">{user?.name}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={handleProfile}
            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            {t("profile")}
          </button>
          <hr className="my-1" />
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 transition-colors duration-200"
          >
            {t("logout")}
          </button>
        </div>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default AuthButton;
