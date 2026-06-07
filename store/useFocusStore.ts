import { create } from 'zustand';

export type FocusMode = 'pomodoro' | 'whiteNoise' | 'typewriter' | 'freeWriting';

interface FocusStore {
  /** Whether a focus task is currently active */
  isActive: boolean;
  /** Which mode is running */
  mode: FocusMode | null;
  /** Display label (e.g. "番茄钟 · 工作中") */
  label: string;
  /** Timestamp when the focus task started */
  startedAt: number | null;
  /** Active white noise type (null = stopped) — kept separate so audio survives navigation */
  whiteNoiseType: string | null;

  startFocus: (mode: FocusMode, label: string, whiteNoiseType?: string | null) => void;
  stopFocus: () => void;
  /** Start/stop white noise only, without changing the main focus mode */
  setWhiteNoise: (type: string | null) => void;
}

export const useFocusStore = create<FocusStore>()((set) => ({
  isActive: false,
  mode: null,
  label: '',
  startedAt: null,
  whiteNoiseType: null,

  startFocus: (mode, label, whiteNoiseType = null) =>
    set({
      isActive: true,
      mode,
      label,
      startedAt: Date.now(),
      whiteNoiseType: whiteNoiseType ?? null,
    }),

  stopFocus: () =>
    set({
      isActive: false,
      mode: null,
      label: '',
      startedAt: null,
      whiteNoiseType: null,
    }),

  setWhiteNoise: (type) =>
    set({
      whiteNoiseType: type,
      // Also toggle isActive so the indicator shows/hides for standalone white noise
      isActive: type !== null,
      mode: type !== null ? 'whiteNoise' : null,
      label: type !== null ? `白噪音` : '',
      startedAt: type !== null ? Date.now() : null,
    }),
}));
