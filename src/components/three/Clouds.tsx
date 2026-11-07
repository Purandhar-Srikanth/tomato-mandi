import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Group, SRGBColorSpace } from 'three'
import { seeded } from './layout'

function puffTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.45, 'rgba(255,255,255,0.55)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** Soft mist puffs drifting slowly over one corner of the plot. */
export function Clouds({ animate }: { animate: boolean }) {
  const group = useRef<Group>(null)
  const texture = useMemo(puffTexture, [])
  useEffect(() => () => texture.dispose(), [texture])

  const puffs = useMemo(() => {
    const rand = seeded(7)
    return Array.from({ length: 16 }, () => ({
      position: [(rand() - 0.5) * 7, 1.6 + rand() * 1.4, (rand() - 0.5) * 5] as [number, number, number],
      size: 2 + rand() * 2.6,
    }))
  }, [])

  useFrame(({ clock }) => {
    if (!group.current || !animate) return
    const t = clock.elapsedTime
    group.current.position.x = -5.5 + Math.sin(t * 0.07) * 1.6
    group.current.position.z = 5 + Math.cos(t * 0.05) * 1
  })

  return (
    <group ref={group} position={[-5.5, 0, 5]}>
      {puffs.map((puff, i) => (
        <sprite key={i} position={puff.position} scale={[puff.size, puff.size * 0.72, 1]}>
          <spriteMaterial map={texture} transparent opacity={0.72} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
