import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// 支持的语言列表
export const locales = ['zh', 'en', 'ja'] as const;
export type Locale = (typeof locales)[number];

// 默认语言
export const defaultLocale: Locale = 'zh';

export default getRequestConfig(async ({ locale }) => {
  // 验证传入的语言是否在支持列表中
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return {
    messages: (await import(`./locales/${locale}.json`)).default
  };
});