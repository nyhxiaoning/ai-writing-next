'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Type, Edit3, Music, Square } from 'lucide-react';

type Mode = 'pomodoro' | 'whiteNoise' | 'typewriter' | 'freeWriting';

export default function FocusPage() {
  const t = useTranslations('WordFlow.focus');
  const [mode, setMode] = useState<Mode>('pomodoro');

  const modes: { key: Mode; label: string; icon: React.ReactNode }[] = [
    { key: 'pomodoro', label: t('pomodoro'), icon: <Play className="h-4 w-4" /> },
    { key: 'whiteNoise', label: t('whiteNoise'), icon: <Music className="h-4 w-4" /> },
    { key: 'typewriter', label: t('typewriter'), icon: <Type className="h-4 w-4" /> },
    { key: 'freeWriting', label: t('freeWriting'), icon: <Edit3 className="h-4 w-4" /> },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Mode tabs */}
      <div className="mb-8 flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
        {modes.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
              mode === m.key
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* Content — use key to force re-mount on mode switch for clean state */}
      {mode === 'pomodoro' && <PomodoroTimer key="pomodoro" />}
      {mode === 'whiteNoise' && <WhiteNoisePlayer key="noise" />}
      {mode === 'typewriter' && <TypewriterMode key="typewriter" />}
      {mode === 'freeWriting' && <FreeWritingMode key="freewrite" />}
    </div>
  );
}

// ─── Pomodoro ────────────────────────────────────────────────────
function PomodoroTimer() {
  const t = useTranslations('WordFlow.focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = (isBreak ? breakDuration : workDuration) * 60;
  const progress = 1 - timeLeft / totalTime;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsBreak((b) => !b);
          setSessions((s) => s + (isBreak ? 0 : 1));
          return isBreak ? workDuration * 60 : breakDuration * 60;
        }
        return prev - 1;
      });
    }, 1000);
    setIsRunning(true);
  }, [clearTimer, isBreak, workDuration, breakDuration]);

  const pauseTimer = () => {
    clearTimer();
    setIsRunning(false);
  };

  const resetTimer = () => {
    clearTimer();
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workDuration * 60);
  };

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-8">
        <svg width="280" height="280" className="transform -rotate-90">
          <circle cx="140" cy="140" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="140" cy="140" r={radius}
            fill="none"
            stroke={isBreak ? '#10b981' : '#6366f1'}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold text-gray-900">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="mt-1 text-sm font-medium text-gray-500">
            {isBreak ? t('break') : t('work')}
          </span>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-4">
        {isRunning ? (
          <button type="button" onClick={pauseTimer} className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700">
            <Pause className="h-6 w-6" />
          </button>
        ) : (
          <button type="button" onClick={startTimer} className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700">
            <Play className="h-6 w-6 ml-0.5" />
          </button>
        )}
        <button type="button" onClick={resetTimer} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-6">
        <div className="text-center">
          <label className="block text-xs text-gray-500 mb-1">{t('workDuration')}</label>
          <input
            type="number"
            value={workDuration}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 25;
              setWorkDuration(val);
              if (!isRunning) setTimeLeft(val * 60);
            }}
            disabled={isRunning}
            className="w-20 rounded border border-gray-300 px-3 py-1.5 text-center text-sm"
            min={1} max={120}
          />
        </div>
        <div className="text-center">
          <label className="block text-xs text-gray-500 mb-1">{t('breakDuration')}</label>
          <input
            type="number"
            value={breakDuration}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 5;
              setBreakDuration(val);
            }}
            disabled={isRunning}
            className="w-20 rounded border border-gray-300 px-3 py-1.5 text-center text-sm"
            min={1} max={60}
          />
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">{t('sessions')}: {sessions}</p>
      </div>
    </div>
  );
}

// ─── White Noise ─────────────────────────────────────────────────
function WhiteNoisePlayer() {
  const t = useTranslations('WordFlow.focus');
  const [active, setActive] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopNoise = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      sourceRef.current = null;
    }
    setActive(null);
  }, []);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
        sourceRef.current = null;
      }
    };
  }, []);

  const playNoise = (type: string) => {
    // If clicking the already-playing type, stop it
    if (active === type) {
      stopNoise();
      return;
    }

    // Stop previous noise
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    const ctx = new AudioContext();
    audioContextRef.current = ctx;

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
          sample = (Math.random() + Math.random() + Math.random()) / 3 * 2 - 1;
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
    setActive(type);
  };

  const noises = [
    { key: 'rain', label: t('rain'), icon: '🌧️' },
    { key: 'cafe', label: t('cafe'), icon: '☕' },
    { key: 'forest', label: t('forest'), icon: '🌲' },
    { key: 'deepspace', label: t('deepspace'), icon: '🌌' },
  ];

  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-6 text-lg font-medium text-gray-900">{t('selectNoise')}</h3>

      {/* Active indicator + stop button */}
      {active && (
        <div className="mb-4 flex items-center gap-3 rounded-full bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
          <Volume2 className="h-4 w-4" />
          正在播放
          <button type="button" onClick={stopNoise} className="ml-2 flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs text-red-600 hover:bg-red-200">
            <Square className="h-3 w-3" /> 停止
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {noises.map((noise) => (
          <button
            key={noise.key}
            type="button"
            onClick={() => playNoise(noise.key)}
            className={`flex flex-col items-center gap-2 rounded-xl border-2 p-8 transition-all ${
              active === noise.key
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <span className="text-4xl">{noise.icon}</span>
            <span className="font-medium text-gray-700">{noise.label}</span>
            {active === noise.key && (
              <span className="flex items-center gap-1 text-xs text-indigo-600">
                <Volume2 className="h-3 w-3" /> 播放中
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Typewriter ───────────────────────────────────────────────────
function TypewriterMode() {
  const t = useTranslations('WordFlow.focus');
  const [text, setText] = useState('');

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">{t('writeSomething')}</p>
        </div>
        {/* Parent container has position:relative so the overlay textarea stays inside */}
        <div className="relative min-h-[400px] rounded-lg border-2 border-indigo-200 bg-white shadow-sm">
          {/* Visible text layer */}
          <div className="p-8">
            <p className="text-lg leading-relaxed text-gray-800">
              {text}
              <span className="typewriter-cursor" />
            </p>
          </div>
          {/* Invisible input layer — absolutely positioned inside the relative parent */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="absolute inset-0 resize-none bg-transparent p-8 text-lg leading-relaxed text-transparent caret-transparent focus:outline-none"
            placeholder=""
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-400">{text.length} 字</span>
          <button
            type="button"
            onClick={() => setText('')}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-50"
          >
            清空
          </button>
        </div>
      </div>

      <style jsx global>{`
        .typewriter-cursor::after {
          content: '|';
          animation: blink 1s step-end infinite;
          color: #6366f1;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Free Writing ─────────────────────────────────────────────────
function FreeWritingMode() {
  const t = useTranslations('WordFlow.focus');
  const [text, setText] = useState('');
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  const startFreeWriting = () => {
    clearTimer();
    intervalRef.current = setInterval(() => setTimer((p) => p + 1), 1000);
    setIsRunning(true);
  };

  const stopFreeWriting = () => {
    clearTimer();
    setIsRunning(false);
  };

  const resetFreeWriting = () => {
    clearTimer();
    setIsRunning(false);
    setTimer(0);
    setText('');
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-center">
        <span className="text-2xl font-bold text-indigo-600">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="w-full max-w-2xl">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('writeSomething')}
          className="min-h-[400px] w-full resize-none rounded-lg border-2 border-gray-200 bg-white p-6 text-lg leading-relaxed focus:border-indigo-300 focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2">
            {isRunning ? (
              <button type="button" onClick={stopFreeWriting} className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                <Pause className="h-4 w-4" /> {t('pause')}
              </button>
            ) : (
              <button type="button" onClick={startFreeWriting} className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
                <Play className="h-4 w-4" /> {timer > 0 ? t('resume') : t('start')}
              </button>
            )}
            <button type="button" onClick={resetFreeWriting} className="flex items-center gap-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <RotateCcw className="h-4 w-4" /> {t('reset')}
            </button>
          </div>
          <span className="text-sm text-gray-400">{text.length} 字</span>
        </div>
      </div>
    </div>
  );
}
