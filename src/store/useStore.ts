import { create } from 'zustand'
import type { AudioData, SelectedBar } from '../data/types'

const emptyFreq = new Uint8Array(128)

type StoreState = {
  audioData: AudioData
  isSynthetic: boolean
  lastUpdatedAt: number
  onboardingPulse: boolean
  setAudioData: (partial: Partial<AudioData>) => void
  setSelectedBar: (bar: SelectedBar | null) => void
  setIsSynthetic: (value: boolean) => void
  setLastUpdatedAt: (time: number) => void
  setOnboardingPulse: (value: boolean) => void
}

export const useStore = create<StoreState>((set) => ({
  audioData: {
    freqData: emptyFreq,
    rms: 0,
    peakHz: 0,
    isListening: false,
    selectedBar: null,
  },
  isSynthetic: false,
  lastUpdatedAt: Date.now(),
  onboardingPulse: false,
  setAudioData: (partial) =>
    set((state) => ({
      audioData: { ...state.audioData, ...partial },
    })),
  setSelectedBar: (bar) =>
    set((state) => ({
      audioData: { ...state.audioData, selectedBar: bar },
    })),
  setIsSynthetic: (value) => set({ isSynthetic: value }),
  setLastUpdatedAt: (time) => set({ lastUpdatedAt: time }),
  setOnboardingPulse: (value) => set({ onboardingPulse: value }),
}))
