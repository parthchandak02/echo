import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

const IDLE_MS = 3000

export function QuietZone() {
  const selectedBar = useStore((s) => s.audioData.selectedBar)
  const setSelectedBar = useStore((s) => s.setSelectedBar)
  const idleTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!selectedBar) return

    if (idleTimer.current) {
      window.clearTimeout(idleTimer.current)
    }

    idleTimer.current = window.setTimeout(() => {
      setSelectedBar(null)
    }, IDLE_MS)

    return () => {
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current)
      }
    }
  }, [selectedBar, setSelectedBar])

  if (!selectedBar) return null

  return (
    <div className="chrome quiet-zone">
      <div className="quiet-zone__value tabular-nums">{selectedBar.hz} Hz</div>
      <div className="quiet-zone__meta tabular-nums">
        amplitude {selectedBar.amplitude} · bar {selectedBar.index}
      </div>
      <button
        type="button"
        className="quiet-zone__close"
        onClick={() => setSelectedBar(null)}
      >
        close
      </button>
    </div>
  )
}
