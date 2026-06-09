import { unstable_setRequestLocale } from 'next-intl/server';

// 认证页面使用 client-side 动态功能（useSearchParams 等），跳过静态生成
export const dynamic = 'force-dynamic';

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export default function AuthLayout({ children, params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  return (
    <main className="grow">
      {children}
    </main>
  );
}