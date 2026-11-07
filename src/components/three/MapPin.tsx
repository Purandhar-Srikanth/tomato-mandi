import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Group, SRGBColorSpace } from 'three'

function pinTexture(color: string, tomato: boolean) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(64, 64, 60, 0, Math.PI * 2)
  ctx.fill()
  ctx.lineWidth = 7
  ctx.strokeStyle = '#FAF3E3'
  ctx.stroke()
  if (tomato) {
    ctx.fillStyle = '#FAF3E3'
    ctx.beginPath()
    ctx.ellipse(64, 72, 30, 27, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#4F8A2E'
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + ((i - 2) * Math.PI) / 4.5
      ctx.beginPath()
      ctx.ellipse(64 + Math.cos(a) * 12, 48 + Math.sin(a) * 6, 13, 5, a, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    ctx.fillStyle = '#FAF3E3'
    ctx.beginPath()
    ctx.arc(64, 64, 20, 0, Math.PI * 2)
    ctx.fill()
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

export function MapPin({
  position,
  color,
  tomato = false,
  size = 1,
  phase = 0,
  animate,
}: {
  position: [number, number, number]
  color: string
  tomato?: boolean
  size?: number
  phase?: number
  animate: boolean
}) {
  const head = useRef<Group>(null)
  const texture = useMemo(() => pinTexture(color, tomato), [color, tomato])
  useEffect(() => () => texture.dispose(), [texture])
  const height = 2.1 * size

  useFrame(({ clock }) => {
    if (head.current && animate) head.current.position.y = height + Math.sin(clock.elapsedTime * 1.5 + phase) * 0.16
  })

  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.018, 0.018, height, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.1, 0.2, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.55} />
      </mesh>
      <group ref={head} position={[0, height, 0]}>
        <Billboard>
          <mesh>
            <circleGeometry args={[0.42 * size, 32]} />
            <meshBasicMaterial map={texture} transparent />
          </mesh>
        </Billboard>
      </group>
    </group>
  )
}
