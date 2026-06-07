'use client';

import { useEffect, useRef } from 'react';
import { useFocusStore } from '@/store/useFocusStore';

/**
 * Global white noise audio engine.
 * Lives in the layout so AudioContext survives page navigation.
 * Renders nothing — purely a side-effect controller.
 */
export default function WhiteNoiseEngine() {
  const whiteNoiseType = useFocusStore((s) => s.whiteNoiseType);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stop = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch {}
      sourceRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  };

  const play = (type: string) => {
    stop();

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      let sample: number;
      switch (type) {
        case 'rain':
          sample = Math.random() * 2 - 1;
          break;
        case 'cafe':
          sample = ((Math.random() + Math.random() + Math.random()) / 3) * 2 - 1;
          break;
        case 'forest':
          sample = Math.sin(i * 0.01) * 0.3 + (Math.random() * 2 - 1) * 0.5;
          break;
        case 'deepspace':
        default:
          sample = Math.random() * 2 - 1;
      }
      data[i] = sample * 0.3;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = 0.3;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    sourceRef.current = source;
  };

  useEffect(() => {
    if (whiteNoiseType) {
      play(whiteNoiseType);
    } else {
      stop();
    }
    return stop;
  }, [whiteNoiseType]);

  return null;
}
