import * as React from 'react'

import { animated, useScroll, useSpring } from '@react-spring/web'

import styles from './index.module.scss'

const X_LINES = 40

const PAGE_COUNT = 10

const INITIAL_WIDTH = 20

export default function Test() {
    const containerRef = React.useRef<HTMLDivElement>(null!)
    const barContainerRef = React.useRef<HTMLDivElement>(null!)

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
        <div ref={containerRef} className={styles.body}>
            <div style={{ color: 'white' }}>
                fadsdfsafdsa dfsa dfsafdsadfs fadsdfsafdsa fadsdfsafdsafdsafdsa fadsdfsafdsa
                美丽的一天从早晨的早材开始，早晨的食材健康，每一个都是好好吃的内容。
                不是说不需要一个限制，而是一定有一些内容不需要这些食材。
            </div>
            <div className={styles.animated__layers}>
                <animated.div ref={barContainerRef} className={styles.bar__container}>
                    {Array.from({ length: X_LINES }).map((_, i) => (
                        <animated.div
                            key={i}
                            className={styles.bar}
                            style={{
                                width: scrollYProgress.to(scrollP => {
                                    const percentilePosition = (i + 1) / X_LINES

                                    return INITIAL_WIDTH / 4 + 40 * Math.cos(((percentilePosition - scrollP) * Math.PI) / 1.5) ** 32
                                }),
                            }}
                        />
                    ))}
                </animated.div>
                <animated.div className={styles.bar__container__inverted}>
                    {Array.from({ length: X_LINES }).map((_, i) => (
                        <animated.div
                            key={i}
                            className={styles.bar}
                            style={{
                                width: scrollYProgress.to(scrollP => {
                                    const percentilePosition = 1 - (i + 1) / X_LINES

                                    return INITIAL_WIDTH / 4 + 40 * Math.cos(((percentilePosition - scrollP) * Math.PI) / 1.5) ** 32
                                }),
                            }}
                        />
                    ))}
                </animated.div>
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
            {new Array(PAGE_COUNT).fill(null).map((_, index) => (
                <div className={styles.full__page} key={index} />
            ))}
        </div>
    )
}
