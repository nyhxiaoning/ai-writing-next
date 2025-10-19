"use client";

import { a, animated, useTrail, useTransition } from "@react-spring/web";
import { useCallback, useEffect, useRef, useState } from "react";

import AuthButton from "@/components/AuthButton";
import Dropdown from "@/components/utils/dropdown";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";
import { styled } from "@stitches/react";
import styles from "./index.module.css";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("HomePage");
  const tCommon = useTranslations("Common");
  const [top, setTop] = useState<boolean>(true);
  const pathname = usePathname();

  // 获取当前语言
  const getCurrentLocale = () => {
    const segments = pathname.split("/");
    const locale = segments[1];
    return ["zh", "en", "ja"].includes(locale) ? locale : "zh";
  };

  const currentLocale = getCurrentLocale();

  // detect whether user has scrolled the page down by 10px
  const scrollHandler = () => {
    window.pageYOffset > 10 ? setTop(false) : setTop(true);
  };
  const reftwo = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [itemstwo, settwo] = useState<string[]>([]);
  const transitionstwo = useTransition(itemstwo, {
    from: {
      opacity: 0,
      height: 0,
      innerHeight: 0,
      transform: "perspective(600px) rotateX(0deg)",
      color: "#8fa5b6",
    },
    enter: [
      { opacity: 1, height: 80, innerHeight: 80 },
      { transform: "perspective(600px) rotateX(180deg)", color: "#28d79f" },
      { transform: "perspective(600px) rotateX(0deg)" },
    ],
    leave: [
      { color: "#c23369" },
      { innerHeight: 0 },
      { opacity: 0, height: 0 },
    ],
    update: { color: "#28b4d7" },
  });

  const reset = useCallback(() => {
    reftwo.current.forEach(clearTimeout);
    reftwo.current = [];
    settwo([]);
    reftwo.current.push(
      setTimeout(() => settwo([t("title"), t("subtitle")]), 2000)
    );
    reftwo.current.push(
      setTimeout(() => settwo([t("title"), t("subtitle")]), 5000)
    );
    reftwo.current.push(
      setTimeout(() => settwo([t("title"), t("subtitle")]), 8000)
    );
  }, [t]);

  /**
   * 首页欢迎动效展示：
   */
  useEffect(() => {
    reset();
    return () => reftwo.current.forEach(clearTimeout);
  }, []);
  useEffect(() => {
    scrollHandler();
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, [top]);

  return (
    <header
      className={`fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out ${
        !top ? "bg-white backdrop-blur-sm shadow-lg" : ""
      }`}
    >
      {/* 导航栏 */}
      <div className="max-w-6xl mx-auto px-5 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* 网站 Logo */}
          <div className="shrink-0 mr-4">
            <Logo />
          </div>

          {/* 桌面导航 */}
          <nav className="hidden md:flex md:grow">
            <ul className="flex grow justify-end flex-wrap items-center">
              <li>
                <Link
                  href={`/${currentLocale}`}
                  className="font-medium text-gray-600 hover:text-gray-900 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  {tCommon("home")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/about`}
                  className="font-medium text-gray-600 hover:text-gray-900 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  {tCommon("about")}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/components-demo`}
                  className="font-medium text-gray-600 hover:text-gray-900 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  组件演示
                </Link>
              </li>
              <li>
                <Link
                  href={`/${currentLocale}/contact`}
                  className="font-medium text-gray-600 hover:text-gray-900 px-5 py-3 flex items-center transition duration-150 ease-in-out"
                >
                  {tCommon("contact")}
                </Link>
              </li>
              {/* <li className="ml-3">
                <LanguageSwitcher />
              </li> */}
            </ul>
          </nav>

          {/* 认证按钮 */}
          <div className="hidden md:flex items-center ml-3">
            <AuthButton />
          </div>

          {/* 移动端菜单 */}
          <MobileMenu />
        </div>
      </div>

      {/* 动画文字展示 */}
      <div className={styles.fixedbottomcenter}>
        <div className={styles.main}>
          {transitionstwo(({ innerHeight, ...rest }, item) => (
            <animated.div
              className={styles.transitionsItem}
              style={rest}
              onClick={reset}
            >
              <animated.div style={{ overflow: "hidden", height: innerHeight }}>
                {item}
              </animated.div>
            </animated.div>
          ))}
        </div>
      </div>
    </header>
  );
}
