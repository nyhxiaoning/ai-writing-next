'use client'

import { useState, useRef, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function MobileMenu() {
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false)
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('Auth')
  const tCommon = useTranslations('Common')

  // 获取当前语言
  const getCurrentLocale = () => {
    const segments = pathname.split('/');
    const locale = segments[1];
    return ['zh', 'en', 'ja'].includes(locale) ? locale : 'zh';
  };

  const currentLocale = getCurrentLocale();

  const trigger = useRef<HTMLButtonElement>(null)
  const mobileNav = useRef<HTMLDivElement>(null)

  // close the mobile menu on click outside
  useEffect(() => {
    const clickHandler = ({ target }: { target: EventTarget | null }): void => {
      if (!mobileNav.current || !trigger.current) return;
      if (!mobileNavOpen || mobileNav.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
      setMobileNavOpen(false)
    };
    document.addEventListener('click', clickHandler)
    return () => document.removeEventListener('click', clickHandler)
  })

  // close the mobile menu if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }): void => {
      if (!mobileNavOpen || keyCode !== 27) return;
      setMobileNavOpen(false)
    };
    document.addEventListener('keydown', keyHandler)
    return () => document.removeEventListener('keydown', keyHandler)
  })

  /**
   * Events
   */
  const handleLogout = () => {
    logout()
    setMobileNavOpen(false)
    router.push(`/${currentLocale}`)
  }

  return (
    <div className="flex md:hidden">
      {/* Hamburger button */}
      <button
        ref={trigger}
        className={`hamburger ${mobileNavOpen && 'active'}`}
        aria-controls="mobile-nav"
        aria-expanded={mobileNavOpen}
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <span className="sr-only">{tCommon('menu')}</span>
        <svg className="w-6 h-6 fill-current text-gray-900" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect y="4" width="24" height="2" />
          <rect y="11" width="24" height="2" />
          <rect y="18" width="24" height="2" />
        </svg>
      </button>

      {/*Mobile navigation */}
      <div ref={mobileNav}>
        <Transition
          show={mobileNavOpen}
          as="nav"
          id="mobile-nav"
          className="absolute top-full h-screen pb-16 z-20 left-0 w-full overflow-scroll bg-white"
          enter="transition ease-out duration-200 transform"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-out duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ul className="px-5 py-2">
            {/* 导航链接 */}
            <li>
              <Link 
                href={`/${currentLocale}`} 
                className="flex font-medium w-full text-gray-600 hover:text-gray-900 py-2 justify-center" 
                onClick={() => setMobileNavOpen(false)}
              >
                {tCommon('home')}
              </Link>
            </li>
            <li>
              <Link 
                href={`/${currentLocale}/about`} 
                className="flex font-medium w-full text-gray-600 hover:text-gray-900 py-2 justify-center" 
                onClick={() => setMobileNavOpen(false)}
              >
                {tCommon('about')}
              </Link>
            </li>
            <li>
              <Link 
                href={`/${currentLocale}/contact`} 
                className="flex font-medium w-full text-gray-600 hover:text-gray-900 py-2 justify-center" 
                onClick={() => setMobileNavOpen(false)}
              >
                {tCommon('contact')}
              </Link>
            </li>
            <li>
              <Link 
                href={`/${currentLocale}/components-demo`} 
                className="flex font-medium w-full text-gray-600 hover:text-gray-900 py-2 justify-center" 
                onClick={() => setMobileNavOpen(false)}
              >
                {tCommon('componentsDemo')}
              </Link>
            </li>
            
            {/* 语言切换器 */}
            <li className="py-2 flex justify-center">
              <LanguageSwitcher />
            </li>
            
            {/* 认证相关 */}
            {isAuthenticated ? (
              <>
                <li className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-center py-2">
                    {user?.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <span className="text-gray-700 font-medium">{user?.name}</span>
                  </div>
                </li>
                <li>
                  <Link 
                    href={`/${currentLocale}/dashboard`} 
                    className="flex font-medium w-full text-gray-600 hover:text-gray-900 py-2 justify-center" 
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="flex font-medium w-full text-red-600 hover:text-red-800 py-2 justify-center"
                  >
                    {t('logout')}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="border-t border-gray-200 pt-4 mt-4">
                  <Link 
                    href={`/${currentLocale}/auth/signin`} 
                    className="flex font-medium w-full text-gray-600 hover:text-gray-900 py-2 justify-center" 
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {t('signin')}
                  </Link>
                </li>
                <li>
                  <Link 
                    href={`/${currentLocale}/auth/signup`} 
                    className="btn-sm text-gray-200 bg-gray-900 hover:bg-gray-800 w-full my-2 flex items-center justify-center" 
                    onClick={() => setMobileNavOpen(false)}
                  >
                    <span>{t('signup')}</span>
                    <svg className="w-3 h-3 fill-current text-gray-400 shrink-0 ml-2 -mr-1" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.707 5.293L7 .586 5.586 2l3 3H0v2h8.586l-3 3L7 11.414l4.707-4.707a1 1 0 000-1.414z" fill="#999" fillRule="nonzero" />
                    </svg>
                  </Link>
                </li>
              </>
            )}
          </ul>          
        </Transition>
      </div>
    </div>
  )
}
