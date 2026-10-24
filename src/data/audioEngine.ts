import type { AudioSnapshot } from './types'

export const palette = {
  bg: '#120030',
  accent1: '#ff00ff',
  accent2: '#00ffff',
  accent3: '#ff6b35',
  glow: '#ff00ff',
  text: 'rgba(255,255,255,0.6)',
} as const

export const strokeWeight = { thin: 0.5, fine: 1, medium: 2, thick: 3 } as const
export const alpha = { bg: 0.08, field: 0.25, active: 0.7, label: 0.45 } as const

const BIN_COUNT = 128
const FFT_SIZE = 256

let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let mediaStream: MediaStream | null = null
let oscillator: OscillatorNode | null = null
let lfo: OscillatorNode | null = null
let gainNode: GainNode | null = null
let usingSynthetic = false
let listening = false

const freqBuffer = new Uint8Array(BIN_COUNT)

export function isSyntheticAudio(): boolean {
  return usingSynthetic
}

export function isAudioListening(): boolean {
  return listening
}

function ensureContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

function setupAnalyser(ctx: AudioContext): AnalyserNode {
  const node = ctx.createAnalyser()
  node.fftSize = FFT_SIZE
  node.smoothingTimeConstant = 0.8
  analyser = node
  return node
}

function setupSyntheticFallback(ctx: AudioContext): void {
  usingSynthetic = true

  oscillator = ctx.createOscillator()
  oscillator.type = 'sine'
  oscillator.frequency.value = 440

  lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 0.35

  const lfoGain = ctx.createGain()
  lfoGain.gain.value = 900

  gainNode = ctx.createGain()
  gainNode.gain.value = 0.35

  const analysis = setupAnalyser(ctx)

  lfo.connect(lfoGain)
  lfoGain.connect(oscillator.frequency)

  oscillator.connect(gainNode)
  gainNode.connect(analysis)
  analysis.connect(ctx.destination)

  oscillator.start()
  lfo.start()
}

async function initAudio(): Promise<void> {
  const ctx = ensureContext()

  if (ctx.state === 'suspended') {
    await ctx.resume()
  }

  if (analyser) return

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    usingSynthetic = false

    const source = ctx.createMediaStreamSource(mediaStream)
    const analysis = setupAnalyser(ctx)
    // Analyse only: routing the mic to ctx.destination would play it back through the
    // speakers and feed back into the mic.
    source.connect(analysis)
  } catch {
    setupSyntheticFallback(ctx)
  }
}

export function readAudio(): AudioSnapshot {
  if (!analyser) {
    return { freqData: freqBuffer, rms: 0, peakHz: 0 }
  }

  analyser.getByteFrequencyData(freqBuffer)

  let sumSquares = 0
  let peakIndex = 0
  let peakValue = 0

  for (let i = 0; i < BIN_COUNT; i++) {
    const value = freqBuffer[i] ?? 0
    sumSquares += value * value
    if (value > peakValue) {
      peakValue = value
      peakIndex = i
    }
  }

  const rms = Math.sqrt(sumSquares / BIN_COUNT)
  const sampleRate = audioContext?.sampleRate ?? 44100
  const peakHz = getPeakFrequency(peakIndex, sampleRate)

  return { freqData: freqBuffer, rms, peakHz }
}

export function getPeakFrequency(binIndex: number, sampleRate = audioContext?.sampleRate ?? 44100): number {
  return binIndex * (sampleRate / FFT_SIZE)
}

export function binIndexToHz(binIndex: number): number {
  return getPeakFrequency(binIndex)
}

export async function startListening(): Promise<void> {
  await initAudio()
  listening = true
}

export function stopListening(): void {
  listening = false

  if (mediaStream) {
    for (const track of mediaStream.getTracks()) {
      track.stop()
    }
    mediaStream = null
  }

  oscillator?.stop()
  lfo?.stop()
  oscillator = null
  lfo = null
  gainNode = null
  analyser = null

  if (audioContext) {
    void audioContext.close()
    audioContext = null
  }

  usingSynthetic = false
  freqBuffer.fill(0)
}

export function getAudioData(): AudioSnapshot {
  if (!listening || !analyser) {
    return { freqData: freqBuffer, rms: 0, peakHz: 0 }
  }
  return readAudio()
}
