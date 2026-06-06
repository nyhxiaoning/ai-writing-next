'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * 仪表板页面
 */
export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('Navigation');
  const tDash = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');

  /**
   * Events
   */
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  /**
   * JSXComponents
   */
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">
                  {t('dashboard')}
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-gray-700 font-medium">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {tDash('welcomeTitle')}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {tDash('welcomeDesc')}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {tDash('userInfo')}
                      </h3>
                      <p className="text-gray-600">
                        {tCommon('email')}: {user?.email}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {tDash('systemStatus')}
                      </h3>
                      <p className="text-green-600">
                        {tDash('systemNormal')}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {tDash('quickActions')}
                      </h3>
                      <button className="text-blue-600 hover:text-blue-800">
                        {tDash('viewSettings')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}