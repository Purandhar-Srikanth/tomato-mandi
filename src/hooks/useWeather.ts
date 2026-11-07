import type { WeatherData } from '../lib/types'
import { useJson } from './useJson'

export const MADANAPALLE = { lat: 13.5503, lon: 78.5029 }

export function useWeather(place: { lat: number; lon: number } | null = MADANAPALLE) {
  const params = new URLSearchParams({
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
    timezone: 'Asia/Kolkata',
    forecast_days: '7',
  })
  const url = place
    ? `https://api.open-meteo.com/v1/forecast?latitude=${place.lat}&longitude=${place.lon}&${params}`
    : null
  return useJson<WeatherData>(url)
}

export type WeatherKind = 'clear' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'storm'

export function weatherKind(code: number): WeatherKind {
  if (code <= 1) return 'clear'
  if (code <= 3) return 'cloudy'
  if (code <= 48) return 'fog'
  if (code <= 57) return 'drizzle'
  if (code <= 82) return 'rain'
  return 'storm'
}

export interface DayValues {
  rain: number
  chance: number
  wind: number
  max: number
  min: number
}

/** Farming warnings for one forecast day, as locale keys under weather.warn. */
export function farmWarnings(day: DayValues, previousWet: boolean) {
  const warnings: string[] = []
  const wet = day.rain >= 5 || day.chance >= 70
  if (day.rain >= 10) warnings.push('heavyRain')
  else if (wet) warnings.push('rainLikely')
  if (wet && previousWet) warnings.push('blight')
  if (day.wind >= 30) warnings.push('wind')
  if (day.max >= 38) warnings.push('heat')
  if (day.min <= 12) warnings.push('cold')
  return warnings
}
