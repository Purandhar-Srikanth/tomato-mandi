/** Plot geometry shared by the scene's parts. All values are world units. */
export const PLOT = 13
export const ROWS = 8
export const PER_ROW = 12
export const ROW_GAP = 1.4
export const PLANT_GAP = 0.98

export const rowZ = (row: number) => (row - (ROWS - 1) / 2) * ROW_GAP
export const plantX = (i: number) => (i - (PER_ROW - 1) / 2) * PLANT_GAP

/** The section inside the glowing harvest box. */
export const HARVEST = { rows: [0, 2], plants: [6, 11] } as const

export const inHarvest = (row: number, i: number) =>
  row >= HARVEST.rows[0] && row <= HARVEST.rows[1] && i >= HARVEST.plants[0] && i <= HARVEST.plants[1]

/** Small seeded generator so the farm looks the same on every load. */
export function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}
