import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

export function DataStamp() {
  const lastUpdatedAt = useStore((s) => s.lastUpdatedAt)
  const isSynthetic = useStore((s) => s.isSynthetic)
  const isListening = useStore((s) => s.audioData.isListening)
  const [secondsAgo, setSecondsAgo] = useState(0)

  useEffect(() => {
    const tick = () => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdatedAt) / 1000))
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [lastUpdatedAt])

  const source = isSynthetic ? 'synthetic audio' : 'Microphone'
  const status = isListening ? 'live' : 'idle'

  return (
    <div className="chrome data-stamp">
      {source} · {status} · 128 bands · updated {secondsAgo}s ago
    </div>
  )
}
