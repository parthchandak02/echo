import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Mesh } from 'three'
import { binIndexToHz } from '../data/audioEngine'
import { useStore } from '../store/useStore'

type FrequencyBarProps = {
  index: number
  position: [number, number, number]
  targetHeight: number
  color: string
}

function invertScale(value: number, outMin: number, outMax: number, inMin: number, inMax: number): number {
  const t = (value - inMin) / (inMax - inMin)
  return outMin + t * (outMax - outMin)
}

export function barHeightFromAmplitude(amplitude: number): number {
  return invertScale(amplitude, 0.1, 6.0, 0, 255)
}

export function barColorForIndex(index: number): string {
  const t = index / 127
  if (t < 0.33) return '#ff00ff'
  if (t < 0.66) return '#00ffff'
  return '#ff6b35'
}

export function FrequencyBar({ index, position, targetHeight, color }: FrequencyBarProps) {
  const meshRef = useRef<Mesh>(null)
  const currentHeight = useRef(0.1)
  const setSelectedBar = useStore((s) => s.setSelectedBar)

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    const eased = currentHeight.current + (targetHeight - currentHeight.current) * Math.min(1, delta * 12)
    currentHeight.current = eased

    mesh.scale.y = Math.max(0.1, eased)
    mesh.position.y = position[1] + eased / 2
  })

  const handleClick = () => {
    const amplitude = useStore.getState().audioData.freqData[index] ?? 0
    setSelectedBar({
      index,
      hz: Math.round(binIndexToHz(index)),
      amplitude,
    })
  }

  return (
    <mesh
      ref={meshRef}
      position={[position[0], position[1] + currentHeight.current / 2, position[2]]}
      onClick={(event) => {
        event.stopPropagation()
        handleClick()
      }}
    >
      <boxGeometry args={[0.12, 1, 0.12]} />
      <meshBasicMaterial color={color} transparent blending={AdditiveBlending} opacity={0.85} />
    </mesh>
  )
}
