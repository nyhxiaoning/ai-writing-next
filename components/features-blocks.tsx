"use client";

import { animated, config, to, useSpring } from '@react-spring/web'
import { dist, scale } from 'vec-la'

import FeaturesBg from "@/public/images/features-bg.png";
import FeaturesBg1 from "@/public/images/features-bg春.jpeg";
import Image from "next/image";
import Link from "next/link";
import styles from "./index.module.css"
import { useDrag } from '@use-gesture/react'
import { useEffect } from "react";

const solarTerms = [
  "立春",
  "雨水",
  "惊蛰",
  "春分",
  "清明",
  "谷雨",
  "立夏",
  "小满",
  "芒种",
  "夏至",
  "小暑",
  "大暑",
  "立秋",
  "处暑",
  "白露",
  "秋分",
  "寒露",
  "霜降",
  "立冬",
  "小雪",
  "大雪",
  "冬至",
  "小寒",
  "大寒",
];

export default function FeaturesBlocks() {
  const [{ pos }, api] = useSpring(() => ({ pos: [0, 0] }))
  const [{ angle }, angleApi] = useSpring(() => ({
    angle: 0,
    config: config.wobbly,
  }))
  // direction calculates pointer direction
  // memo is like a cache, it contains the values that you return inside "set"
  // this way we can inject the springs current coordinates on the initial event and
  // add movement to it for convenience

  const bind = useDrag(
    (state) => {
      const { xy, down, movement: pos, velocity, direction } = state;

      api.start({
        pos,
        immediate: down,
        config: { velocity: scale(direction, velocity), decay: true },
      });

      // 使用状态的变化计算位置差异
      const distance = dist(xy, state.offset);
      if (distance > 10 || !down) {
        angleApi.start({ angle: Math.atan2(direction[0], -direction[1]) });
      }
    },
    { from: (state) => state.offset } // 使用 `from` 选项初始化
  );
  
  useEffect(() => {
    const scrollContainer = document.getElementById("scrollContainer");
    let scrollAmount = 0;

    const scrollHorizontally = () => {
      scrollAmount += 1;
      if (scrollContainer) {
        scrollContainer.scrollLeft = scrollAmount;
      }
      requestAnimationFrame(scrollHorizontally);
    };
    requestAnimationFrame(scrollHorizontally);
  }, []);

  return (
    <section className="relative">
      {/* Section background */}
      <div
        className="absolute inset-0 top-1/2 md:mt-24 lg:mt-0 bg-gray-900 pointer-events-none"
        aria-hidden="true"
      ></div>
      <div className="absolute left-0 right-0 bottom-0 m-auto w-px p-px h-20 bg-gray-200 transform translate-y-1/2"></div>
      <animated.div
        className={styles.rocket}
        {...bind()}
        style={{
          transform: to(
            [pos, angle],
            // @ts-ignore
            ([x, y], a) => `translate3d(${x}px,${y}px,0) rotate(${a}rad)`
          ),
        }}
      />
      )
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 mb-4">写给生活的二十四节气</h2>
            <p className="text-xl text-gray-600">走过的日子，还是太快了。</p>
          </div>

          {/* Horizontal scroll container */}
          <div
            id="scrollContainer"
            className="flex overflow-x-auto gap-6 pb-8"
            style={{
              scrollBehavior: "smooth",
              animation: "scrollLeft 4s linear infinite",
            }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <Link href={`/blog/${i + 1}`} key={i}>
                <div
                  className="relative flex-shrink-0 w-40 h-40 flex flex-col items-center p-6 bg-white rounded-full shadow-xl cursor-pointer hover:transform hover:scale-150 transition-all duration-700"
                  style={{
                    animation: `fadeIn 1s ease ${i * 0.2}s forwards, 
                                transformToCircle 4s ease ${i * 0.3}s forwards`,
                    opacity: 0,
                    transform: "scale(0.5)",
                  }}
                >
                  <Image
                    className="md:max-w-none mx-auto rounded-full"
                    src={i % 2 === 0 ? FeaturesBg1 : FeaturesBg1}
                    width={130}
                    height={130}
                    alt="Features bg"
                  />
                </div>
              </Link>
            ))}
          </div>
          {/* Horizontal scroll container */}
          <div
            id="scrollContainer"
            className="flex overflow-x-auto gap-6 pb-8"
            style={{
              scrollBehavior: "smooth",
              animation: "scrollLeft 4s linear infinite",
            }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <Link href={`/blog/${i + 1}`} key={i}>
                <div
                  className="relative flex-shrink-0 w-40 h-40 flex flex-col items-center p-6 bg-white rounded-full shadow-xl cursor-pointer hover:transform hover:scale-150 transition-all duration-700"
                  style={{
                    animation: `fadeIn 1s ease ${i * 0.2}s forwards, 
                                transformToCircle 4s ease ${i * 0.3}s forwards`,
                    opacity: 0,
                    transform: "scale(0.5)",
                  }}
                >
                  <Image
                    className="md:max-w-none mx-auto rounded-full"
                    src={i % 2 === 0 ? FeaturesBg1 : FeaturesBg1}
                    width={130}
                    height={130}
                    alt="Features bg"
                  />
                </div>
              </Link>
            ))}
          </div>
          {/* Horizontal scroll container */}
          <div
            id="scrollContainer"
            className="flex overflow-x-auto gap-6 pb-8"
            style={{
              scrollBehavior: "smooth",
              animation: "scrollLeft 4s linear infinite",
            }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <Link href={`/blog/${i + 1}`} key={i}>
                <div
                  className="relative flex-shrink-0 w-40 h-40 flex flex-col items-center p-6 bg-white rounded-full shadow-xl cursor-pointer hover:transform hover:scale-150 transition-all duration-700"
                  style={{
                    animation: `fadeIn 1s ease ${i * 0.2}s forwards, 
                                transformToCircle 4s ease ${i * 0.3}s forwards`,
                    opacity: 0,
                    transform: "scale(0.5)",
                  }}
                >
                  <Image
                    className="md:max-w-none mx-auto rounded-full"
                    src={i % 2 === 0 ? FeaturesBg1 : FeaturesBg1}
                    width={130}
                    height={130}
                    alt="Features bg"
                  />
                </div>
              </Link>
            ))}
          </div>
          {/* Horizontal scroll container */}
          <div
            id="scrollContainer"
            className="flex overflow-x-auto gap-6 pb-8"
            style={{
              scrollBehavior: "smooth",
              animation: "scrollLeft 4s linear infinite",
            }}
          >
            {Array.from({ length: 24 }, (_, i) => (
              <Link href={`/blog/${i + 1}`} key={i}>
                <div
                  className="relative flex-shrink-0 w-40 h-40 flex flex-col items-center p-6 bg-white rounded-full shadow-xl cursor-pointer hover:transform hover:scale-150 transition-all duration-700"
                  style={{
                    animation: `fadeIn 1s ease ${i * 0.5}s forwards, 
                                transformToCircle 4s ease ${i * 0.5}s forwards`,
                    opacity: 0,
                    transform: "scale(1)",
                  }}
                >
                  <Image
                    className="md:max-w-none mx-auto rounded-full"
                    src={i % 2 === 0 ? FeaturesBg1 : FeaturesBg1}
                    width={130}
                    height={130}
                    alt="Features bg"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes transformToCircle {
          to {
            transform: scale(1);
          }
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </section>
  );
}
