"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { locales, type Locale } from "@/i18n";

const languageNames: Record<Locale, string> = {
  zh: "中文",
  en: "English",
  ja: "日本語",
};

const languageFlags: Record<Locale, string> = {
  zh: "🇨🇳",
  en: "🇺🇸",
  ja: "🇯🇵",
};

export default function LanguageSwitcher() {
  const t = useTranslations("Common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (newLocale: Locale) => {
    startTransition(() => {
      // 获取当前路径，移除语言前缀
      let pathWithoutLocale = pathname;
      console.log("%s 当前的值💡 pathname");
      console.log(
        "%c💡 pathname当前的最新打印，用完删除",
        "background-color:blue;color:#fff",
        pathname
      );
      // 如果当前路径包含语言前缀，移除它
      if (pathname.startsWith(`/${locale}`) && locale !== "zh") {
        pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
      }

      // 构建新路径
      let newPath;
      if (newLocale === "zh") {
        // 中文是默认语言，不需要前缀
        newPath = pathWithoutLocale === "/" ? "/" : pathWithoutLocale;
      } else {
        // 其他语言需要前缀
        newPath = `/${newLocale}${
          pathWithoutLocale === "/" ? "" : pathWithoutLocale
        }`;
      }

      console.log("Language switch:", {
        currentLocale: locale,
        newLocale,
        pathname,
        pathWithoutLocale,
        newPath,
      });

      router.push(newPath);
      setIsOpen(false);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      >
        <span className="text-lg">{languageFlags[locale]}</span>
        <span className="text-sm font-medium text-gray-700">
          {languageNames[locale]}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
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

      {/* 打开下啦菜单列表选择语言 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                disabled={isPending}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 transition-colors duration-200 ${
                  locale === lang ? "bg-blue-50 text-blue-600" : "text-gray-700"
                }`}
              >
                <span className="text-lg">{languageFlags[lang]}</span>
                <span className="font-medium">{languageNames[lang]}</span>
                {locale === lang && (
                  <svg
                    className="w-4 h-4 ml-auto text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isPending && (
        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
