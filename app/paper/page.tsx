"use client"

import * as React from "react";

import { animated, useScroll } from "@react-spring/web";

import styles from "./index.module.scss";

/**
 * 默认页面的数量
 */
const PAGE_COUNT = 1;

export default function ScrollBackground() {
  const containerRef = React.useRef<HTMLDivElement>(null!);

  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  return (
    <div>
      <div
        ref={containerRef}
        className={styles.scrollContainer}
        style={{ height: "100vh" }} // 增加页面高度以便滚动
      >
        {/* 动态背景 */}
        <animated.div
          className={styles.scrollBackground}
          style={{
            position: "fixed", // 背景固定在屏幕上，覆盖整个可视区域
            top: 0,
            left: 0,
            width: "100vw", // 占据整个页面宽度
            height: "100vh", // 占据整个页面高度
            backgroundColor: "rgba(0, 0, 0, 0.5)", // 背景颜色，半透明黑色
            clipPath: scrollYProgress.to(
              (val) => `circle(${Math.max(val * 100, 1)}% at 50% 50%)`
            ), // 从中心圆形扩展到全屏
            transition: "clip-path 0.3s ease" // 平滑过渡效果
          }}
        />

        {/* 内容 */}
        <div style={{ zIndex: 1, position: "relative", padding: "2rem", color: "white" }}>
          <h1 className={styles.title}>滚动页面，背景圆圈逐渐扩展</h1>
          {new Array(PAGE_COUNT).fill(null).map((_, index) => (
            <div key={index} className={styles.fullPage}>
              <p>这是页面 {index + 1}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
