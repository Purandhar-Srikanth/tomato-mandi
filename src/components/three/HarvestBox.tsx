import { Line } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Group, MeshBasicMaterial, SRGBColorSpace } from 'three'
import { HARVEST, plantX, PLANT_GAP, ROW_GAP, rowZ } from './layout'

function tagTexture(text: string, background: string, ink: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = background
  ctx.beginPath()
  ctx.roundRect(4, 4, 504, 120, 30)
  ctx.fill()
  ctx.fillStyle = ink
  ctx.font = '700 52px Manrope, "Noto Sans Telugu", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 256, 68, 470)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** Tag drawn on both faces, so its text is never mirrored as the farm rotates. */
function Tag({
  text,
  background,
  ink,
  position,
  rotation,
  width,
}: {
  text: string
  background: string
  ink: string
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
}) {
  const texture = useMemo(() => tagTexture(text, background, ink), [text, background, ink])
  useEffect(() => () => texture.dispose(), [texture])
  return (
    <group position={position} rotation={rotation}>
      {[0, Math.PI].map((turn) => (
        <mesh key={turn} rotation={[0, turn, 0]} position={[0, 0, turn ? -0.005 : 0.005]}>
          <planeGeometry args={[width, width / 4]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      ))}
    </group>
  )
}

/** The 12 edges of a box, as point pairs for a thick segmented line. */
function boxEdges(x: number, y: number, z: number) {
  const c = (sx: number, sy: number, sz: number): [number, number, number] => [(sx * x) / 2, (sy * y) / 2, (sz * z) / 2]
  const points: [number, number, number][] = []
  for (const a of [-1, 1]) {
    for (const b of [-1, 1]) {
      points.push(c(-1, a, b), c(1, a, b), c(a, -1, b), c(a, 1, b), c(a, b, -1), c(a, b, 1))
    }
  }
  return points
}

export function HarvestBox({ animate, readyLabel, crateLabel }: { animate: boolean; readyLabel: string; crateLabel: string }) {
  const x0 = plantX(HARVEST.plants[0]) - PLANT_GAP / 2
  const x1 = plantX(HARVEST.plants[1]) + PLANT_GAP / 2
  const z0 = rowZ(HARVEST.rows[0]) - ROW_GAP / 2
  const z1 = rowZ(HARVEST.rows[1]) + ROW_GAP / 2
  const width = x1 - x0
  const depth = z1 - z0
  const height = 1.75

  const points = useMemo(() => boxEdges(width, height, depth), [width, depth])
  const frame = useRef<Group>(null)
  const glow = useRef<MeshBasicMaterial>(null)

  useFrame(({ clock }) => {
    if (!animate || !glow.current) return
    glow.current.opacity = 0.12 + (0.5 + Math.sin(clock.elapsedTime * 1.8) * 0.5) * 0.08
  })

  return (
    <group>
      <group ref={frame} position={[(x0 + x1) / 2, height / 2 + 0.03, (z0 + z1) / 2]}>
        <Line points={points} segments color="#EAF65C" lineWidth={2.6} />
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshBasicMaterial ref={glow} color="#E9F75A" transparent opacity={0.16} depthWrite={false} />
        </mesh>
      </group>
      <Tag
        text={readyLabel}
        background="#F2C230"
        ink="#1F3A1F"
        width={3}
        position={[x0 + 1.7, height + 0.34, z1 + 0.02]}
        rotation={[-0.28, 0, 0.07]}
      />
      <Tag
        text={crateLabel}
        background="#FAF3E3"
        ink="#1F3A1F"
        width={2}
        position={[x1 + 0.02, height + 0.3, z0 + 1.2]}
        rotation={[0, Math.PI / 2, -0.07]}
      />
    </group>
  )
}
