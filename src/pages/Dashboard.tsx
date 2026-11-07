import { CloudRain, TrendingDown, TrendingUp, Trophy, Wind, type LucideIcon } from 'lucide-react'
import { lazy, Suspense, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { FarmHero } from '../components/FarmHero'
import { Gauge } from '../components/Gauge'
import { MiniMap } from '../components/MiniMap'
import { PriceTable } from '../components/PriceTable'
import { Card, CountUp, CtaClasses, CtaIcon, Reveal, SourceBadge } from '../components/ui'
import { useDaily, useForecast } from '../hooks/usePrices'
import { useWeather } from '../hooks/useWeather'
import { fmtDate, rupees, signedPct } from '../lib/format'
import { forecastChangePct, netPrices, nextRainDay, outlookLevel, outlookScore } from '../lib/market'
import type { Market } from '../lib/types'

// Recharts is heavy, so it stays out of the first bundle phones download.
const AreaTrend = lazy(() => import('../components/Charts').then((m) => ({ default: m.AreaTrend })))

const TABLE_MARKETS = ['madanapalle', 'kolar', 'pune', 'nashik', 'delhi', 'bengaluru']
const NEARBY = ['madanapalle', 'kolar', 'anantapur', 'chittoor', 'bengaluru']

function WeatherBlock() {
  const { t } = useTranslation()
  const { data, failed } = useWeather()
  return (
    <div>
      <h1 className="display text-5xl leading-none sm:text-6xl">{t('app.name')}</h1>
      <p className="mt-2 text-sm font-medium text-muted">{t('dashboard.tagline')}</p>
      <div className="mt-5">
        <p className="display num text-6xl leading-none">
          {data ? <CountUp value={Math.round(data.current.temperature_2m)} suffix="°C" /> : '--°C'}
        </p>
        <p className="mt-1 text-sm font-medium text-muted">{failed ? t('weather.unavailable') : t('dashboard.liveWeather')}</p>
      </div>
      {data && (
        <dl className="mt-4 flex gap-5 text-sm">
          <div className="flex items-center gap-1.5">
            <CloudRain size={16} aria-hidden />
            <dt className="sr-only">{t('weather.rainChance')}</dt>
            <dd className="font-bold tabular">{data.daily.precipitation_probability_max[0] ?? 0}%</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind size={16} aria-hidden />
            <dt className="sr-only">{t('weather.wind')}</dt>
            <dd className="font-bold tabular">{Math.round(data.current.wind_speed_10m)} km/h</dd>
          </div>
        </dl>
      )}
    </div>
  )
}

function useTips(markets: Market[]) {
  const { t, i18n } = useTranslation()
  const { data: weather } = useWeather()
  return useMemo(() => {
    const home = markets.find((m) => m.id === 'madanapalle')
    if (!home) return []
    const tips: { icon: LucideIcon; text: string }[] = []

    tips.push({
      icon: home.weekChangePct >= 0 ? TrendingUp : TrendingDown,
      text: t(home.weekChangePct >= 0 ? 'dashboard.tipRising' : 'dashboard.tipFalling', {
        pct: Math.abs(home.arrivalsChangePct),
        dir: t(home.arrivalsChangePct < 0 ? 'dashboard.below' : 'dashboard.above'),
      }),
    })

    if (weather) {
      const day = nextRainDay(weather)
      tips.push({
        icon: CloudRain,
        text: !day
          ? t('dashboard.tipDry')
          : day === weather.daily.time[0]
            ? t('dashboard.tipRainToday')
            : t('dashboard.tipRain', { day: fmtDate(day, i18n.language, { weekday: 'long' }) }),
      })
    }

    const ranked = netPrices(markets.filter((m) => NEARBY.includes(m.id)), home, 0.8, 4)
    const best = ranked[0]
    const local = ranked.find((r) => r.market.id === 'madanapalle')
    if (best && local) {
      tips.push({
        icon: Trophy,
        text: t('dashboard.tipBest', {
          market: t(`markets.${best.market.id}`),
          gain: rupees(Math.max(0, best.net - local.net), 1),
        }),
      })
    }
    return tips
  }, [markets, weather, t, i18n.language])
}

function MandiAiCard({ markets }: { markets: Market[] }) {
  const { t } = useTranslation()
  const { data: daily } = useDaily()
  const { data: forecast } = useForecast()
  const tips = useTips(markets)
  const home = markets.find((m) => m.id === 'madanapalle')
  const score = forecast && home ? outlookScore(forecastChangePct(forecast), home.arrivalsChangePct) : null

  return (
    <Card className="!p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="display text-2xl">{t('dashboard.mandiAi')}</h2>
        <SourceBadge meta={daily?.meta} />
      </div>
      <p className="mb-2 text-sm font-medium text-muted">{t('dashboard.priceOutlook')}</p>
      {score !== null && <Gauge value={score} label={t(`dashboard.outlook.${outlookLevel(score)}`)} />}
      <ul className="mt-4 space-y-2.5">
        {tips.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm font-medium">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-sun">
              <Icon size={14} aria-hidden />
            </span>
            <span className="pt-0.5">{text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#7FA544] via-[#5E9A35] to-[#3F7A2A] p-3">
        <Link to="/predict" className={CtaClasses('w-full')}>
          <CtaIcon />
          {t('dashboard.viewInsights')}
        </Link>
      </div>
      <p className="mt-2 text-center text-xs text-muted">{t('predict.disclaimer')}</p>
    </Card>
  )
}

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const { data } = useDaily()
  const markets = useMemo(() => data?.markets ?? [], [data])

  const week = useMemo(() => {
    const history = markets.find((m) => m.id === 'madanapalle')?.history.slice(-7) ?? []
    const points = history.map((h) => ({
      label: fmtDate(h.date, i18n.language, { weekday: 'short' }),
      value: h.modal,
    }))
    const peak = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0)
    const change = points.length ? (points[peak].value / points[0].value - 1) * 100 : 0
    return { points, peak, change }
  }, [markets, i18n.language])

  return (
    <div className="space-y-5">
      <div className="relative flex flex-col gap-5 lg:block lg:min-h-[640px]">
        <FarmHero
          markets={markets}
          className="-mx-4 h-[330px] sm:mx-0 sm:h-[420px] lg:absolute lg:inset-y-0 lg:left-[130px] lg:right-[290px] lg:h-auto"
          controlsClass="lg:right-[56px]"
        />
        <div className="lg:pointer-events-none lg:absolute lg:left-2 lg:top-4 lg:w-64">
          <WeatherBlock />
        </div>
        <div className="lg:absolute lg:right-0 lg:top-0 lg:w-[330px]">
          <MandiAiCard markets={markets} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.7fr_1.1fr]">
        <Reveal>
          <MiniMap markets={markets} meta={data?.meta} />
        </Reveal>
        <Reveal delay={0.08}>
          <Card className="h-full">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-bold">{t('dashboard.todayPrices')}</h2>
              <SourceBadge meta={data?.meta} />
            </div>
            <PriceTable markets={markets.filter((m) => TABLE_MARKETS.includes(m.id))} />
            <p className="mt-2 text-xs text-muted">{t('prices.unit')}</p>
          </Card>
        </Reveal>
        <Reveal delay={0.16}>
          <Card className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-bold">{t('dashboard.weeklyPrice')}</h2>
              <SourceBadge meta={data?.meta} />
            </div>
            <p className="text-sm text-muted">{t('markets.madanapalle')}</p>
            {week.points.length > 0 && (
              <Suspense fallback={<div className="h-[250px]" />}>
                <AreaTrend
                  data={week.points}
                  highlight={week.peak}
                  bubble={signedPct(week.change, 0)}
                  height={250}
                  label={t('dashboard.weeklyPrice')}
                />
              </Suspense>
            )}
          </Card>
        </Reveal>
      </div>
    </div>
  )
}
