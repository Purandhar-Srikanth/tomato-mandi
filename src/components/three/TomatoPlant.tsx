import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, Euler, InstancedMesh, Matrix4, Quaternion, Vector3 } from 'three'
import { inHarvest, PER_ROW, plantX, rowZ, ROWS, seeded } from './layout'

interface Item {
  position: [number, number, number]
  scale: [number, number, number]
  rotation?: [number, number, number]
  color?: string
}

function fill(mesh: InstancedMesh | null, items: Item[]) {
  if (!mesh) return
  const matrix = new Matrix4()
  const quat = new Quaternion()
  const color = new Color()
  items.forEach((item, i) => {
    quat.setFromEuler(new Euler(...(item.rotation ?? [0, 0, 0])))
    matrix.compose(new Vector3(...item.position), quat, new Vector3(...item.scale))
    mesh.setMatrixAt(i, matrix)
    if (item.color) mesh.setColorAt(i, color.set(item.color))
  })
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

const LEAF_GREENS = ['#4F8A2E', '#5E9A35', '#3F7A2A', '#6DA63C']
const RED_SHADES = ['#E5482B', '#D93A20', '#EC5A36']
const UNRIPE = ['#B6C24A', '#E8953A', '#D9B23F']

function buildPlants() {
  const rand = seeded(42)
  const leaves: Item[] = []
  const fruit: Item[] = []
  const stakes: Item[] = []
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]

  for (let row = 0; row < ROWS; row++) {
    for (let i = 0; i < PER_ROW; i++) {
      const x = plantX(i) + (rand() - 0.5) * 0.08
      const z = rowZ(row) + (rand() - 0.5) * 0.08
      const ripe = inHarvest(row, i)

      stakes.push({ position: [x, 0.55, z - 0.2], scale: [1, 1, 1] })

      for (let l = 0; l < 6; l++) {
        const angle = (l / 6) * Math.PI * 2 + rand()
        const y = 0.22 + (l % 3) * 0.26 + rand() * 0.08
        const spread = 0.24 - (l % 3) * 0.05
        const size = 0.2 + rand() * 0.09
        leaves.push({
          position: [x + Math.cos(angle) * spread, y, z + Math.sin(angle) * spread],
          scale: [size, size * 0.82, size],
          rotation: [rand() * 3, rand() * 3, rand() * 3],
          color: pick(LEAF_GREENS),
        })
      }

      const count = ripe ? 7 : 3 + Math.floor(rand() * 3)
      for (let f = 0; f < count; f++) {
        const angle = rand() * Math.PI * 2
        const size = 0.075 + rand() * 0.035
        fruit.push({
          position: [x + Math.cos(angle) * 0.33, 0.24 + rand() * 0.5, z + Math.sin(angle) * 0.33],
          scale: [size, size * 0.92, size],
          color: ripe || rand() > 0.45 ? pick(RED_SHADES) : pick(UNRIPE),
        })
      }
    }
  }
  return { leaves, fruit, stakes }
}

/** All 96 plants, drawn as three instanced meshes so it is only three draw calls. */
export function TomatoPlants() {
  const { leaves, fruit, stakes } = useMemo(buildPlants, [])
  const leafRef = useRef<InstancedMesh>(null)
  const fruitRef = useRef<InstancedMesh>(null)
  const stakeRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    fill(leafRef.current, leaves)
    fill(fruitRef.current, fruit)
    fill(stakeRef.current, stakes)
  }, [leaves, fruit, stakes])

  return (
    <group>
      <instancedMesh ref={leafRef} args={[undefined, undefined, leaves.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial flatShading roughness={0.85} />
      </instancedMesh>
      <instancedMesh ref={fruitRef} args={[undefined, undefined, fruit.length]} castShadow>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial roughness={0.35} />
      </instancedMesh>
      <instancedMesh ref={stakeRef} args={[undefined, undefined, stakes.length]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 1.1, 5]} />
        <meshStandardMaterial color="#B99A6B" roughness={0.9} />
      </instancedMesh>
    </group>
  )
}
