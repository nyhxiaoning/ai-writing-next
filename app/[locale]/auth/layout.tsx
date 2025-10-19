import { unstable_setRequestLocale } from 'next-intl/server';

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