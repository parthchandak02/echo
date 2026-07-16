import { Suspense, useCallback, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { startListening } from './data/audioEngine'
import { useStore } from './store/useStore'
import { AudioReactiveField } from './components/AudioReactiveField'
import { Background } from './components/Background'
import { DataStamp } from './components/DataStamp'
import { Description } from './components/Description'
import { HeroStats } from './components/HeroStats'
import { Legend } from './components/Legend'
import { QuietZone } from './components/QuietZone'

export default function App() {
  const [isListening, setIsListening] = useState(false)
  const setAudioData = useStore((s) => s.setAudioData)
  const setOnboardingPulse = useStore((s) => s.setOnboardingPulse)
  const onboardingPulse = useStore((s) => s.onboardingPulse)

  const handleActivateMic = useCallback(async () => {
    await startListening()
    setIsListening(true)
    setAudioData({ isListening: true })
    setOnboardingPulse(true)
    window.setTimeout(() => setOnboardingPulse(false), 3000)
  }, [setAudioData, setOnboardingPulse])

  useEffect(() => {
    if (!isListening) {
      setAudioData({ isListening: false })
    }
  }, [isListening, setAudioData])

  return (
    <div className="app">
      <Canvas
        className="scene-canvas"
        camera={{ position: [0, 4, 14], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Background />
          <AudioReactiveField isListening={isListening} />
          <OrbitControls enablePan={false} minDistance={6} maxDistance={24} />
        </Suspense>
      </Canvas>

      <div className="chrome-layer">
        <HeroStats />
        <DataStamp />
        <Legend />
        <Description />
        <QuietZone />
      </div>

      {!isListening && (
        <div className="mic-activation">
          <button type="button" className="mic-button" onClick={handleActivateMic} aria-label="Tap to start listening">
            <span className="mic-button__dot" />
          </button>
          <span className="mic-button__label">Tap to start listening</span>
        </div>
      )}

      {onboardingPulse && <div className="onboarding-glow" aria-hidden="true" />}
    </div>
  )
}
