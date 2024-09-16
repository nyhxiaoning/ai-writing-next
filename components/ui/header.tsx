"use client";

import { a, animated, useTrail, useTransition } from "@react-spring/web";
import { useCallback, useEffect, useRef, useState } from "react";

import Dropdown from "@/components/utils/dropdown";
import Link from "next/link";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";
import { styled } from "@stitches/react";
import styles from "./index.module.css";

export default function Header() {
  const [top, setTop] = useState<boolean>(true);

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
      setTimeout(() => settwo(["欢迎来到文字世界", "文字塑造时间"]), 2000)
    );
    reftwo.current.push(
      setTimeout(() => settwo(["欢迎来到文字世界", "文字塑造时间"]), 5000)
    );
    reftwo.current.push(
      setTimeout(() => settwo(["欢迎来到文字世界", "文字塑造时间"]), 8000)
    );
  }, []);

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
