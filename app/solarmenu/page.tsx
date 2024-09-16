/*
 * @Author: ningyongheng ningyongheng@jeejio.com
 * @Date: 2024-09-13 13:14:40
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2024-09-16 12:39:45
 * @FilePath: /tailwind-landing-page-template/app/blog/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client";

/**
 * 设计1-24节气表：设计表：处理这里的时候，这里内容配置mysql
 */
import React, { useEffect, useState } from "react";
import { animated, useSpring, useTransition } from "@react-spring/web";
import {
  useParams,
  usePathname,
  useRouter,
  useSelectedLayoutSegment,
} from "next/navigation";

import { Card } from "./components/Card/index.tsx";
import { Dock } from "./components/Dock/index.tsx";
import { DockCard } from "./components/DockCard/index.tsx";
import { DockDivider } from "./components/DockDivider/index.tsx";
import Link from "next/link";
import data from "./data.ts";
import shuffle from "lodash.shuffle";
import styles from "./styles.module.css";

const GRADIENTS = [
  "https://products.ls.graphics/mesh-gradients/images/03.-Snowy-Mint_1-p-130x130q80.jpeg",
  "https://products.ls.graphics/mesh-gradients/images/04.-Hopbush_1-p-130x130q80.jpeg",
  "https://products.ls.graphics/mesh-gradients/images/06.-Wisteria-p-130x130q80.jpeg",
  "https://products.ls.graphics/mesh-gradients/images/09.-Light-Sky-Blue-p-130x130q80.jpeg",
  "https://products.ls.graphics/mesh-gradients/images/12.-Tumbleweed-p-130x130q80.jpeg",
  "https://products.ls.graphics/mesh-gradients/images/15.-Perfume_1-p-130x130q80.jpeg",
  "https://products.ls.graphics/mesh-gradients/images/36.-Pale-Chestnut-p-130x130q80.jpeg",
];

const PageMenu = () => {
  const [url, setUrl] = useState("");
  const [solarName, setSolarName] = useState("");
  debugger;
  const { value } = useSpring({
    from: {
      value: 0.3,
    },
    to: {
      value: 0.6,
    },
    loop: true,
    config: {
      duration: 8000,
    },
  });
  const [rows, set] = useState(data);
  useEffect(() => {
    if (typeof window !== "undefined") {
      setUrl(window.location.href); // 获取完整的 URL
      debugger;
    }
    const t = setInterval(() => set(shuffle), 2000);
    return () => clearInterval(t);
  }, []);

  let height = 0;
  const transitions = useTransition(
    rows.map((data) => ({
      ...data,
      y: (height += data.height) - data.height,
    })),
    {
      key: (item: any) => item.name,
      from: { height: 0, opacity: 0 },
      leave: { height: 0, opacity: 0 },
      enter: ({ y, height }) => ({ y, height, opacity: 1 }),
      update: ({ y, height }) => ({ y, height }),
    }
  );

  return (
    <div className={styles.body}>
      <div style={{ color: "white", fontSize: "50px" }}>
        <div>{decodeURI(url.split("?")[1])}</div>
      </div>
      <div className={styles.list} style={{ height }}>
        <animated.div
          style={{
            x: value.to({
              output: [
                "0%",
                "-5%",
                "-15%",
                "7%",
                "-5%",
                "-15%",
                "15%",
                "0%",
                "3%",
                "-10%",
              ],
            }),
            y: value.to({
              output: [
                "0%",
                "-10%",
                "5%",
                "-25%",
                "25%",
                "10%",
                "0%",
                "15%",
                "35%",
                "10%",
              ],
            }),
          }}
          className={styles.noise}
        />
        {transitions((style, item, t, index) => (
          <animated.div
            className={styles.card}
            style={{ zIndex: data.length - index, ...style }}
          >
            <div className={styles.cell}>
              <div
                className={styles.details}
                style={{ backgroundImage: item.css }}
              />
            </div>
            <div className={styles.textaligncontent}>
              <Link legacyBehavior href={`/solar/${item.link}`}>
                <a> {item.name}</a>
              </Link>
            </div>
          </animated.div>
        ))}
      </div>
      <div className={styles.bottomposdock}>
        <Dock>
          {GRADIENTS.map((src, index) =>
            src ? (
              <DockCard key={src}>
                <Card src={src} />
              </DockCard>
            ) : (
              <DockDivider key={index} />
            )
          )}
        </Dock>
      </div>
    </div>
  );
};

export default PageMenu;
