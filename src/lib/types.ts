export type DataSource = 'sample' | 'mixed' | 'agmarknet'

export interface Meta {
  source: DataSource
  asOf?: string
  note?: string
  model?: string
}

export interface Market {
  id: string
  name: string
  state: string
  lat: number
  lon: number
  grade: string
  min: number
  max: number
  modal: number
  arrivals: number
  arrivalsCapacity: number
  arrivalsChangePct: number
  changePct: number
  weekChangePct: number
  history: { date: string; modal: number }[]
}

export interface DailyFile {
  meta: Meta
  markets: Market[]
}

export interface MonthlyFile {
  meta: Meta
  series: Record<string, { month: string; price: number }[]>
}

export interface ForecastFile {
  meta: Meta
  market: string
  history: { date: string; price: number }[]
  forecast: { date: string; price: number; lo: number; hi: number }[]
}

export interface Trader {
  id: string
  name: string
  market: string
  type: 'agent' | 'trader'
  yard: string
  phone: string
}

export interface TradersFile {
  meta: Meta
  traders: Trader[]
  routes: { city: string; km: number; ratePerKg: number }[]
}

export interface WeatherData {
  current: {
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    precipitation_probability_max: (number | null)[]
    wind_speed_10m_max: number[]
  }
}
