"use client";

import { IParallax, Parallax, ParallaxLayer } from "@react-spring/parallax";
import React, { useEffect, useRef, useState } from "react";

import styles from "./styles.module.scss";

interface PageProps {
  offset: number;
  gradient: string;
  onClick: () => void;
}

const season = ["春", "夏", "秋", "冬"];

const Page = ({ offset, gradient, onClick }: PageProps) => (
  <>
    <ParallaxLayer offset={offset} speed={0.6} onClick={onClick}>
      <div className={`${styles.slopeEnd} ${styles[gradient]}`} />
    </ParallaxLayer>

    <ParallaxLayer offset={offset} speed={0.2} onClick={onClick}>
      <div className={styles.slopeBegin} />
    </ParallaxLayer>

    <ParallaxLayer
      className={`${styles.text} ${styles.number}`}
      offset={offset}
      speed={0.3}
    >
      {/* <span>0{offset + 1}</span> */}
      <span
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          alert(1);
        }}
      >
        {season[offset]}
      </span>
    </ParallaxLayer>
  </>
);

export default function App() {
  const parallax = useRef<IParallax>(null);
  const scroll = (to: number) => {
    if (parallax.current) {
      parallax.current.scrollTo(to);
    }
  };
  useEffect(() => {
    setInterval(() => {
      Promise.resolve()
        .then(() => {
          setTimeout(() => {
            scroll(1);
          }, 1000);
        })

        .then(() => {
          setTimeout(() => {
            scroll(2);
          }, 3000);
        })
        .then(() => {
          setTimeout(() => {
            scroll(3);
          }, 5000);
        })
        .then(() => {
          setTimeout(() => {
            scroll(0);
          }, 7000);
        });
    }, 10000);
  });
  return (
    <div style={{ background: "#dfdfdf" }}>
      <Parallax
        className={styles.container}
        ref={parallax}
        pages={4}
        horizontal
      >
        <Page offset={0} gradient="teal" onClick={() => alert("春")} />
        <Page offset={1} gradient="pink" onClick={() => alert("夏")} />
        <Page offset={2} gradient="tomato" onClick={() => alert("秋")} />
        <Page offset={3} gradient="white" onClick={() => alert("冬")} />
      </Parallax>
    </div>
  );
}
