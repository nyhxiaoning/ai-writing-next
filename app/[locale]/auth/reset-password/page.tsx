'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

/**
 * 重置密码页面
 */
export default function ResetPassword() {
  const t = useTranslations('Auth');

  return (
    <section className="bg-gradient-to-b from-gray-100 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Page header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              重置密码
            </h1>
            <p className="text-xl text-gray-600">
              输入您的邮箱地址，我们将发送重置链接给您
            </p>
          </div>

          {/* Form */}
          <div className="max-w-sm mx-auto">
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">演示提示</h3>
              <p className="text-sm text-yellow-600">
                这是一个演示页面，密码重置功能尚未实现。
              </p>
            </div>

            <form>
              <div className="flex flex-wrap -mx-3 mb-4">
                <div className="w-full px-3">
                  <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">
                    {t('email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-input w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="请输入您的邮箱地址"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap -mx-3 mt-6">
                <div className="w-full px-3">
                  <button
                    type="submit"
                    disabled
                    className="btn text-white bg-gray-400 w-full cursor-not-allowed"
                  >
                    发送重置链接 (演示中)
                  </button>
                </div>
              </div>
            </form>

            <div className="text-gray-600 text-center mt-6">
              记起密码了？{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:underline transition duration-150 ease-in-out">
                {t('signin')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}