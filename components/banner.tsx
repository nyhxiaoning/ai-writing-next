'use client'

import { a, animated, useTrail, useTransition } from '@react-spring/web'
import { useRef, useState } from 'react'

import { styled } from '@stitches/react'

const Container = styled('div', {
  display: 'flex',
  gap: 10,
  marginBottom: 80,
})

const Box = styled('div', {
  position: 'relative',
  height: 50,
  width: 50,
})

const SharedStyles = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  inset: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'Helvetica',
  fontWeight: 800,
  backfaceVisibility: 'hidden',
}

const FrontBox = styled(animated.div, {
  ...SharedStyles,
  backgroundColor: '#fafafa',
  border: 'solid 2px #1a1a1a',
})

const BackBox = styled(animated.div, {
  ...SharedStyles,
  backgroundColor: '#6cab64',
  border: 'solid 2px #6cab64',
  color: '#fafafa',
})

const itemscurrent = ['修', '己', '以', '敬', ',', '文', '质', '彬', '彬']


export default function Banner() {
  const [trail, api] = useTrail(itemscurrent.length, () => ({
    rotateX: 0,
  }))

  const isFlipped = useRef(false)

  const handleClick = () => {
    if (isFlipped.current) {
      api.start({
        rotateX: 0,
      })
      isFlipped.current = false
    } else {
      api.start({
        rotateX: 180,
      })
      isFlipped.current = true
    }
  }
  const [bannerOpen, setBannerOpen] = useState<boolean>(true)

  return (
    <>
      <Container onClick={handleClick}>
        {trail.map(({ rotateX }, i) => (
          <Box key={i}>
            <FrontBox
              key={itemscurrent[i]}
              style={{
                transform: rotateX.to(val => `perspective(600px) rotateX(${val}deg)`),
                transformStyle: 'preserve-3d',
              }}>
              {'?'}
            </FrontBox>
            <BackBox
              style={{
                transform: rotateX.to(val => `perspective(600px) rotateX(${180 - val}deg)`),
                transformStyle: 'preserve-3d',
              }}>
              {(itemscurrent[i])}
            </BackBox>
          </Box>
        ))}
      </Container>
    </>
  )
}