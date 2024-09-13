"use client";

import * as React from 'react'

import { animated, useScroll, useSpring } from '@react-spring/web'

import styles from './index.module.scss'

export default function ArticlePage(){
    const containerRef = React.useRef<HTMLDivElement>(null!)

    const [textStyles, textApi] = useSpring(() => ({
        y: '100%',
    }))

    const { scrollYProgress } = useScroll({
        container: containerRef,
        onChange: ({ value: { scrollYProgress } }) => {
            if (scrollYProgress > 0.7) {
                textApi.start({ y: '0' })
            } else {
                textApi.start({ y: '100%' })
            }
        },
        default: {
            immediate: true,
        },
    })

    return (
        <div>
            <animated.div
                className={styles.dot}
                style={{
                    clipPath: scrollYProgress.to(val => `circle(${val * 100}%)`),
                }}>
                <h1 className={styles.title}>
                    <span>
                        <animated.span style={textStyles}>读完了，谢谢你了</animated.span>
                    </span>
                    <span>
                        <animated.span style={textStyles}>好好学习，天天向上!</animated.span>
                    </span>
                </h1>
            </animated.div>
        </div>
    )

}