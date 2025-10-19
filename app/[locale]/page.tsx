import Banner from "@/components/banner";
// import DebugInfo from "@/components/DebugInfo";
import Footer from "@/components/ui/footer";
import Header from "@/components/ui/header";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { unstable_setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string };
};

export default function HomePage({ params: { locale } }: Props) {
  // 启用静态渲染
  unstable_setRequestLocale(locale);

  const t = useTranslations("HomePage");
  const tCommon = useTranslations("Common");

  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* 语言切换器 */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>

        {/* 主要内容 */}
        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              {/* 页面标题 */}
              <div className="text-center pb-12 md:pb-16">
                <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter tracking-tighter mb-4">
                  {t("title")}
                </h1>
                <div className="max-w-3xl mx-auto">
                  <p className="text-xl text-gray-600 mb-8">{t("subtitle")}</p>
                  <p className="text-lg text-gray-500 mb-8">
                    {t("description")}
                  </p>
                  <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <div>
                      <button className="btn text-white bg-blue-600 hover:bg-blue-700 w-full mb-4 sm:w-auto sm:mb-0">
                        {t("getStarted")}
                      </button>
                    </div>
                    <div>
                      <button className="btn text-gray-600 bg-gray-100 hover:bg-gray-200 w-full sm:w-auto">
                        {t("learnMore")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 功能展示 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">多语言支持</h3>
                  <p className="text-gray-600">
                    支持中文、英文、日文等多种语言
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">响应式设计</h3>
                  <p className="text-gray-600">完美适配手机、平板、桌面设备</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">高性能</h3>
                  <p className="text-gray-600">基于 Next.js 14 的现代化架构</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Banner />
      <Footer />
      {/* <DebugInfo /> */}
    </>
  );
}
