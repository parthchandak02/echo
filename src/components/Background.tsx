import { Html } from '@react-three/drei'

export function Background() {
  return (
    <Html fullscreen transform={false} style={{ pointerEvents: 'none' }}>
      <div className="scene-background" aria-hidden="true">
        <div className="scene-background__gradient" />
        <div className="scene-background__scanlines" />
        <div className="scene-background__grid" />
      </div>
    </Html>
  )
}
