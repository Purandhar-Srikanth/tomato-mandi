import type { DailyFile, ForecastFile, MonthlyFile, TradersFile } from '../lib/types'
import { useJson } from './useJson'

export const useDaily = () => useJson<DailyFile>('/data/prices_daily.json')
export const useMonthly = () => useJson<MonthlyFile>('/data/prices_monthly_10y.json')
export const useForecast = () => useJson<ForecastFile>('/data/forecast.json')
export const useTraders = () => useJson<TradersFile>('/data/traders.json')
