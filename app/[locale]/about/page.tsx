import Header from "@/components/ui/header";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { unstable_setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

type Props = {
  params: { locale: string };
};

export default function AboutPage({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const tAbout = useTranslations("About");
  const tCommon = useTranslations("Common");

  return (
    <>
      <Header />
      <main className="flex-grow">
        {/* 语言切换器 */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>

        <section className="relative">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="pt-32 pb-12 md:pt-40 md:pb-20">
              <div className="text-center pb-12 md:pb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tighter tracking-tighter mb-4">
                  {tCommon("about")}
                </h1>
                <div className="max-w-3xl mx-auto">
                  <p className="text-xl text-gray-600 mb-8">
                    {tCommon("valuesystem")}
                  </p>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-6">{tAbout("ourStory")}</h2>
                    <p className="text-gray-600 mb-4">
                      {tAbout("description1")}
                    </p>
                    <p className="text-gray-600 mb-4">
                      {tAbout("description2")}
                    </p>
                    <p className="text-gray-600">
                      {tAbout("description3")}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
                      <svg
                        className="w-16 h-16 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{tAbout("continuousLearning")}</h3>
                    <p className="text-gray-600">
                      {tAbout("continuousLearningDesc")}
                    </p>
                  </div>
                </div>

                {/* 技术栈展示 */}
                <div className="mt-16">
                  <h2 className="text-3xl font-bold text-center mb-12">
                    {tAbout("techStack")}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">N</span>
                      </div>
                      <h4 className="font-semibold">{tAbout("nextjs")}</h4>
                      <p className="text-sm text-gray-600">{tAbout("nextjsDesc")}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">TS</span>
                      </div>
                      <h4 className="font-semibold">{tAbout("typescript")}</h4>
                      <p className="text-sm text-gray-600">{tAbout("typescriptDesc")}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">TW</span>
                      </div>
                      <h4 className="font-semibold">{tAbout("tailwind")}</h4>
                      <p className="text-sm text-gray-600">{tAbout("tailwindDesc")}</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">
                          i18n
                        </span>
                      </div>
                      <h4 className="font-semibold">{tAbout("nextIntl")}</h4>
                      <p className="text-sm text-gray-600">{tAbout("nextIntlDesc")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
