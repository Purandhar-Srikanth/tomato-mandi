/** Non-text crop facts. Names and descriptions live in the locale files. */

export type Season = 'kharif' | 'rabi' | 'summer'
export type Purpose = 'table' | 'processing'
export type Shape = 'round' | 'oval' | 'flat'

export interface Variety {
  id: string
  type: 'hybrid' | 'open' | 'local'
  days: string
  yieldTHa: string
  seasons: Season[]
  purpose: Purpose[]
  shape: Shape
}

export const varieties: Variety[] = [
  { id: 'arkaRakshak', type: 'hybrid', days: '135–140', yieldTHa: '75–80', seasons: ['kharif', 'rabi', 'summer'], purpose: ['table', 'processing'], shape: 'round' },
  { id: 'arkaSamrat', type: 'hybrid', days: '135–140', yieldTHa: '80–85', seasons: ['kharif', 'rabi'], purpose: ['table'], shape: 'round' },
  { id: 'arkaVikas', type: 'open', days: '135–140', yieldTHa: '35–40', seasons: ['kharif', 'rabi'], purpose: ['table'], shape: 'flat' },
  { id: 'pusaRuby', type: 'open', days: '125–135', yieldTHa: '30–35', seasons: ['rabi', 'summer'], purpose: ['table'], shape: 'flat' },
  { id: 'pkm1', type: 'open', days: '130–135', yieldTHa: '30–35', seasons: ['kharif', 'rabi'], purpose: ['table', 'processing'], shape: 'flat' },
  { id: 'pusaGaurav', type: 'open', days: '130–140', yieldTHa: '30–40', seasons: ['rabi', 'summer'], purpose: ['processing'], shape: 'oval' },
  { id: 'commercialHybrid', type: 'hybrid', days: '130–150', yieldTHa: '60–90', seasons: ['kharif', 'rabi', 'summer'], purpose: ['table'], shape: 'oval' },
  { id: 'nati', type: 'local', days: '110–130', yieldTHa: '15–25', seasons: ['kharif', 'rabi'], purpose: ['table'], shape: 'flat' },
]

export type Task = 'sow' | 'transplant' | 'harvest'

/** Month ranges are 0-based and may wrap past December. */
export const calendar: { id: string; main?: boolean; tasks: Record<Task, [number, number][]> }[] = [
  { id: 'rayalaseema', main: true, tasks: { sow: [[0, 5]], transplant: [[1, 6]], harvest: [[3, 10]] } },
  { id: 'karnataka', tasks: { sow: [[4, 6], [10, 0]], transplant: [[5, 7], [11, 1]], harvest: [[8, 11], [2, 5]] } },
  { id: 'maharashtra', tasks: { sow: [[4, 5], [8, 9], [0, 0]], transplant: [[5, 6], [9, 10], [1, 1]], harvest: [[8, 11], [0, 2], [4, 5]] } },
  { id: 'north', tasks: { sow: [[9, 10], [5, 6]], transplant: [[11, 1], [6, 7]], harvest: [[2, 5], [9, 11]] } },
]

/** Days from sowing, for the crop duration timeline. */
export const stages = [
  { id: 'nursery', from: 0, to: 28, color: '#F2C230' },
  { id: 'establish', from: 28, to: 58, color: '#C7D66B' },
  { id: 'flowering', from: 58, to: 93, color: '#A8C23A' },
  { id: 'picking', from: 93, to: 150, color: '#E5482B' },
]

export const pests = ['leafCurl', 'earlyBlight', 'lateBlight', 'fruitBorer', 'whitefly', 'wilt']

export const schemes = [
  { id: 'drip', url: 'https://pmksy.gov.in/' },
  { id: 'pmfby', url: 'https://pmfby.gov.in/' },
  { id: 'pmkisan', url: 'https://pmkisan.gov.in/' },
  { id: 'midh', url: 'https://midh.da.gov.in/' },
  { id: 'greens', url: 'https://www.mofpi.gov.in/' },
  { id: 'enam', url: 'https://enam.gov.in/' },
]
