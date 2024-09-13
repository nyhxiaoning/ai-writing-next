/*
 * @Author: ningyongheng ningyongheng@jeejio.com
 * @Date: 2024-09-13 13:14:40
 * @LastEditors: ningyongheng ningyongheng@jeejio.com
 * @LastEditTime: 2024-09-13 14:12:58
 * @FilePath: /tailwind-landing-page-template/app/blog/page.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
"use client";

/**
 * 设计1-24节气表：设计表：处理这里的时候，这里内容配置mysql
 */
import React, { useEffect, useState } from "react";
import { animated, useTransition } from "@react-spring/web";

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
  null,
  "https://products.ls.graphics/mesh-gradients/images/36.-Pale-Chestnut-p-130x130q80.jpeg",
];

const PageMenu = () => {
     const [rows, set] = useState(data);
     useEffect(() => {
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
      <div className={styles.list} style={{ height }}>
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
              <Link legacyBehavior href={`/blog/${item.link}`}>
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
