import { useStore } from '../store/useStore'

export function HeroStats() {
  const peakHz = useStore((s) => s.audioData.peakHz)
  const rms = useStore((s) => s.audioData.rms)

  return (
    <div className="chrome hero-stats">
      <div className="hero-stats__peak tabular-nums">{Math.round(peakHz)}</div>
      <div className="hero-stats__peak-label">peak frequency</div>
      <div className="hero-stats__rms tabular-nums">RMS amplitude {Math.round(rms)}</div>
    </div>
  )
}
