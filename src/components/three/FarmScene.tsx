import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Matrix4, PCFShadowMap, Vector3 } from 'three'
import { Clouds } from './Clouds'
import { HarvestBox } from './HarvestBox'
import { PLOT, ROWS, ROW_GAP, rowZ, seeded } from './layout'
import { MapPin } from './MapPin'
import { TomatoPlants } from './TomatoPlant'

const CREAM = '#F1E4CC'

/** Thick floating slab: brown soil sides, a green crop surface and raised beds. */
function Plot() {
  return (
    <group>
      <mesh position={[0, -0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[PLOT, 1.3, PLOT]} />
        <meshStandardMaterial color="#7A5433" roughness={1} />
      </mesh>
      <mesh position={[0, -1.32, 0]}>
        <boxGeometry args={[PLOT - 0.5, 0.2, PLOT - 0.5]} />
        <meshStandardMaterial color="#5F3F26" roughness={1} />
      </mesh>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[PLOT + 0.06, 0.1, PLOT + 0.06]} />
        <meshStandardMaterial color="#7FA544" roughness={1} />
      </mesh>
      {Array.from({ length: ROWS }, (_, row) => (
        <mesh key={row} position={[0, 0.03, rowZ(row)]} receiveShadow>
          <boxGeometry args={[PLOT - 0.9, 0.06, ROW_GAP * 0.62]} />
          <meshStandardMaterial color="#6B5A3A" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

/** Empty beige field rows around the plot, fading out into the fog. */
function SurroundingFields() {
  const ref = useRef<InstancedMesh>(null)
  const tiles = useMemo(() => {
    const rand = seeded(11)
    const list: { x: number; z: number; len: number; tint: string }[] = []
    for (let gx = -3; gx <= 3; gx++) {
      for (let gz = -3; gz <= 3; gz++) {
        if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1 && gx * gz !== 0) continue
        const horizontal = (gx + gz) % 2 === 0
        for (let r = 0; r < 7; r++) {
          const offset = (r - 3) * 1.4
          list.push({
            x: gx * 12.5 + (horizontal ? 0 : offset),
            z: gz * 12.5 + (horizontal ? offset : 0),
            len: horizontal ? 1 : -1,
            tint: rand() > 0.5 ? '#D9C49B' : '#CDB688',
          })
        }
      }
    }
    return list
  }, [])

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const matrix = new Matrix4()
    const color = new Color()
    const scale = new Vector3()
    tiles.forEach((tile, i) => {
      scale.set(tile.len > 0 ? 11 : 0.8, 1, tile.len > 0 ? 0.8 : 11)
      matrix.makeScale(scale.x, scale.y, scale.z).setPosition(tile.x, -3.1, tile.z)
      mesh.setMatrixAt(i, matrix)
      mesh.setColorAt(i, color.set(tile.tint))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [tiles])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.25, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#EADBBB" roughness={1} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, tiles.length]} receiveShadow>
        <boxGeometry args={[1, 0.22, 1]} />
        <meshStandardMaterial roughness={1} />
      </instancedMesh>
    </group>
  )
}

export interface FarmSceneProps {
  autoRotate: boolean
  animate: boolean
  visible: boolean
  zoomable: boolean
  readyLabel: string
  crateLabel: string
  onContextLost: () => void
}

export default function FarmScene({ autoRotate, animate, visible, zoomable, readyLabel, crateLabel, onContextLost }: FarmSceneProps) {
  return (
    <Canvas
      className="farm-canvas"
      dpr={[1, 1.5]}
      shadows={{ type: PCFShadowMap }}
      flat
      frameloop={!visible ? 'never' : animate || autoRotate ? 'always' : 'demand'}
      camera={{ position: [20, 18.5, 20], fov: 30, near: 1, far: 140 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
      onCreated={({ gl }) => gl.domElement.addEventListener('webglcontextlost', onContextLost)}
    >
      <fog attach="fog" args={[CREAM, 38, 72]} />
      <hemisphereLight args={['#FFF6E4', '#B39B6E', 1.5]} />
      <directionalLight
        castShadow
        position={[9, 16, 5]}
        intensity={2.1}
        color="#FFE9C4"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={45}
        shadow-bias={-0.0006}
      />
      <group position={[0, 0.3, 0]}>
        <Plot />
        <TomatoPlants />
        <HarvestBox animate={animate} readyLabel={readyLabel} crateLabel={crateLabel} />
        <MapPin position={[-2.4, 0.1, -1.6]} color="#E5482B" tomato size={1.25} animate={animate} />
        <MapPin position={[-4.4, 0.1, 2.5]} color="#7E8F35" phase={1.4} animate={animate} />
        <MapPin position={[2.2, 0.1, 3.8]} color="#7E8F35" phase={2.6} animate={animate} />
        <Clouds animate={animate} />
      </group>
      <SurroundingFields />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={zoomable}
        autoRotate={autoRotate}
        autoRotateSpeed={0.45}
        enableDamping
        minPolarAngle={0.65}
        maxPolarAngle={1.12}
        minDistance={24}
        maxDistance={46}
        target={[0, 0, 0]}
      />
    </Canvas>
  )
}
