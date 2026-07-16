import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, MeshBasicMaterial, type InstancedMesh, Object3D } from 'three'
import { useStore } from '../store/useStore'

const PARTICLE_COUNT = 32
const dummy = new Object3D()

function invertScale(value: number, outMin: number, outMax: number, inMin: number, inMax: number): number {
  const t = (value - inMin) / (inMax - inMin)
  return outMin + t * (outMax - outMin)
}

function bassHue(bassAvg: number): string {
  const hue = invertScale(bassAvg, 280, 330, 0, 255)
  return `hsl(${hue}, 100%, 60%)`
}

export function ParticleRing() {
  const meshRef = useRef<InstancedMesh>(null)
  const materialRef = useRef<MeshBasicMaterial>(null)
  const radiusRef = useRef(3)

  const color = useMemo(() => new Color('#ff00ff'), [])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const { freqData, rms } = useStore.getState().audioData

    let bassSum = 0
    for (let i = 0; i < 16; i++) {
      bassSum += freqData[i] ?? 0
    }
    const bassAvg = bassSum / 16

    const targetRadius = invertScale(rms, 1, 8, 0, 255)
    radiusRef.current += (targetRadius - radiusRef.current) * 0.12

    const ringColor = bassHue(bassAvg)
    if (materialRef.current) {
      materialRef.current.color.set(ringColor)
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2
      dummy.position.set(
        Math.cos(angle) * radiusRef.current,
        0.2,
        Math.sin(angle) * radiusRef.current,
      )
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.03, 8, 8]} />
      <meshBasicMaterial
        ref={materialRef}
        color={color}
        transparent
        blending={AdditiveBlending}
        opacity={0.9}
      />
    </instancedMesh>
  )
}
