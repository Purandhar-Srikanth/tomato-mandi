import { clamp } from './format'
import type { ForecastFile, Market, WeatherData } from './types'

const toRad = (deg: number) => (deg * Math.PI) / 180

/** Straight-line km, stretched by 1.3 to approximate road distance. */
export function roadKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h)) * 1.3
}

export interface NetPrice {
  market: Market
  km: number
  transport: number
  commission: number
  net: number
}

export function netPrices(
  markets: Market[],
  from: { lat: number; lon: number },
  ratePer100Km: number,
  commissionPct: number,
): NetPrice[] {
  return markets
    .map((market) => {
      const km = roadKm(from, market)
      const transport = (km / 100) * ratePer100Km
      const commission = market.modal * (commissionPct / 100)
      return { market, km, transport, commission, net: market.modal - transport - commission }
    })
    .sort((a, b) => b.net - a.net)
}

/** Forecast change from the latest price to the end of the 4-week horizon. */
export function forecastChangePct(forecast: ForecastFile) {
  const last = forecast.history.at(-1)?.price
  const end = forecast.forecast.at(-1)?.price
  return last && end ? (end / last - 1) * 100 : 0
}

/** Rough 0-100 selling score: rising outlook and thin arrivals push it up. */
export function outlookScore(forecastPct: number, arrivalsChangePct: number) {
  return Math.round(clamp(55 + forecastPct * 0.9 - arrivalsChangePct * 0.6, 5, 95))
}

export function outlookLevel(score: number) {
  return score >= 60 ? 'good' : score >= 40 ? 'watch' : 'weak'
}

/** First day in the next five that looks too wet to pick or spray. */
export function nextRainDay(weather: WeatherData) {
  const { time, precipitation_sum, precipitation_probability_max } = weather.daily
  return time
    .slice(0, 5)
    .find((_, i) => precipitation_sum[i] >= 5 || (precipitation_probability_max[i] ?? 0) >= 70)
}
