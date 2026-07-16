import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { getAudioData, isSyntheticAudio } from '../data/audioEngine'
import { useStore } from '../store/useStore'
import { barColorForIndex, barHeightFromAmplitude, FrequencyBar } from './FrequencyBar'
import { ParticleRing } from './ParticleRing'

const BAR_COUNT = 128

function invertScale(value: number, outMin: number, outMax: number, inMin: number, inMax: number): number {
  const t = (value - inMin) / (inMax - inMin)
  return outMin + t * (outMax - outMin)
}

type AudioReactiveFieldProps = {
  isListening: boolean
}

export function AudioReactiveField({ isListening }: AudioReactiveFieldProps) {
  const setAudioData = useStore((s) => s.setAudioData)
  const setIsSynthetic = useStore((s) => s.setIsSynthetic)
  const setLastUpdatedAt = useStore((s) => s.setLastUpdatedAt)

  const barLayout = useMemo(() => {
    return Array.from({ length: BAR_COUNT }, (_, index) => {
      const x = invertScale(index, -8, 8, 0, BAR_COUNT - 1)
      const curve = Math.sin((index / (BAR_COUNT - 1)) * Math.PI) * 2.5
      return {
        index,
        position: [x, 0, -curve] as [number, number, number],
        color: barColorForIndex(index),
      }
    })
  }, [])

  useFrame(() => {
    if (!isListening) return

    const snapshot = getAudioData()
    setAudioData({
      freqData: snapshot.freqData,
      rms: snapshot.rms,
      peakHz: snapshot.peakHz,
      isListening: true,
    })
    setIsSynthetic(isSyntheticAudio())
    setLastUpdatedAt(Date.now())
  })

  const freqData = useStore((s) => s.audioData.freqData)

  return (
    <group>
      {barLayout.map((bar) => (
        <FrequencyBar
          key={bar.index}
          index={bar.index}
          position={bar.position}
          targetHeight={barHeightFromAmplitude(freqData[bar.index] ?? 0)}
          color={bar.color}
        />
      ))}
      <ParticleRing />
    </group>
  )
}
