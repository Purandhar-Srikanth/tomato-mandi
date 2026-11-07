import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, MapPin, Search, Sun, TriangleAlert, Wind, type LucideIcon } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CountUp, CtaClasses, Loading, PageHeader, Reveal, SubNav } from '../components/ui'
import { growPages } from '../data/nav'
import { farmWarnings, MADANAPALLE, useWeather, weatherKind, type WeatherKind } from '../hooks/useWeather'
import { fmtDate } from '../lib/format'

const ICONS: Record<WeatherKind, LucideIcon> = {
  clear: Sun, cloudy: Cloud, fog: CloudFog, drizzle: CloudDrizzle, rain: CloudRain, storm: CloudLightning,
}

interface Place {
  id?: number
  name: string
  admin1?: string
  latitude: number
  longitude: number
}

export default function Weather() {
  const { t, i18n } = useTranslation()
  const [place, setPlace] = useState({ ...MADANAPALLE, name: t('markets.madanapalle') })
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[] | null>(null)
  const [searchFailed, setSearchFailed] = useState(false)
  const { data, failed } = useWeather(place)

  const search = async (e: FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchFailed(false)
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json&countryCode=IN`
      const res = await fetch(url)
      const json = await res.json()
      setResults(json.results ?? [])
    } catch {
      setSearchFailed(true)
    }
  }

  const days = data?.daily.time.map((date, i) => {
    const values = {
      rain: data.daily.precipitation_sum[i],
      chance: data.daily.precipitation_probability_max[i] ?? 0,
      wind: data.daily.wind_speed_10m_max[i],
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
    }
    const prevWet = i > 0 && (data.daily.precipitation_sum[i - 1] >= 5 || (data.daily.precipitation_probability_max[i - 1] ?? 0) >= 70)
    return { date, values, kind: weatherKind(data.daily.weather_code[i]), warnings: farmWarnings(values, prevWet) }
  })

  return (
    <>
      <PageHeader title={t('weather.title')} intro={t('weather.intro')} />
      <SubNav pages={growPages} />

      <form onSubmit={search} className="mb-3 flex max-w-xl gap-2">
        <label className="relative flex-1">
          <span className="sr-only">{t('weather.search')}</span>
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('weather.search')}
            className="min-h-11 w-full rounded-full border border-line bg-white/70 pl-9 pr-3 text-sm placeholder:text-muted"
          />
        </label>
        <button type="submit" className={CtaClasses()}>{t('weather.find')}</button>
      </form>
      {searchFailed && <p className="mb-3 text-sm text-cta">{t('weather.searchFailed')}</p>}
      {results && (
        <ul className="mb-4 flex flex-wrap gap-2">
          {results.length === 0 && <li className="text-sm text-muted">{t('nav.noResults')}</li>}
          {results.map((r) => (
            <li key={r.id ?? `${r.latitude}-${r.longitude}`}>
              <button
                type="button"
                className="min-h-10 rounded-full border border-line bg-card px-3 text-sm font-semibold hover:bg-white"
                onClick={() => {
                  setPlace({ lat: r.latitude, lon: r.longitude, name: r.name })
                  setResults(null)
                  setQuery('')
                }}
              >
                {r.name}{r.admin1 ? `, ${r.admin1}` : ''}
              </button>
            </li>
          ))}
        </ul>
      )}

      {failed && <Card><p className="text-center text-muted">{t('weather.unavailable')}</p></Card>}
      {!failed && !data && <Loading />}
      {data && days && (
        <>
          <Card className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-1.5 font-bold"><MapPin size={15} aria-hidden />{place.name}</p>
              <p className="display num mt-1 text-6xl"><CountUp value={Math.round(data.current.temperature_2m)} suffix="°C" /></p>
              <p className="text-sm text-muted">{t(`weather.kinds.${weatherKind(data.current.weather_code)}`)}</p>
            </div>
            <dl className="flex gap-6 text-sm">
              <div><dt className="text-muted">{t('weather.humidity')}</dt><dd className="font-bold tabular">{data.current.relative_humidity_2m}%</dd></div>
              <div><dt className="text-muted">{t('weather.wind')}</dt><dd className="font-bold tabular">{Math.round(data.current.wind_speed_10m)} km/h</dd></div>
            </dl>
          </Card>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {days.map(({ date, values, kind, warnings }) => {
              const Icon = ICONS[kind]
              return (
                <Reveal key={date}>
                  <Card className="h-full !p-4">
                    <p className="text-sm font-bold">{fmtDate(date, i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })}</p>
                    <div className="my-2 flex items-center justify-between">
                      <Icon size={28} className="text-lime-deep" aria-label={t(`weather.kinds.${kind}`)} />
                      <p className="display num text-2xl">{Math.round(values.max)}°<span className="ml-1 text-base text-muted">{Math.round(values.min)}°</span></p>
                    </div>
                    <p className="flex justify-between text-xs text-muted tabular">
                      <span className="flex items-center gap-1"><CloudRain size={13} aria-hidden />{values.chance}% · {values.rain.toFixed(1)} mm</span>
                      <span className="flex items-center gap-1"><Wind size={13} aria-hidden />{Math.round(values.wind)}</span>
                    </p>
                    {warnings.map((w) => (
                      <p key={w} className="mt-2 flex items-start gap-1.5 rounded-xl bg-sun/35 px-2 py-1.5 text-xs font-semibold">
                        <TriangleAlert size={13} className="mt-0.5 shrink-0" aria-hidden />
                        {t(`weather.warn.${w}`)}
                      </p>
                    ))}
                  </Card>
                </Reveal>
              )
            })}
          </div>
          <p className="mt-4 text-xs text-muted">
            <a className="underline" href="https://open-meteo.com/" target="_blank" rel="noreferrer">{t('weather.credit')}</a>
          </p>
        </>
      )}
    </>
  )
}
