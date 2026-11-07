import { useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axis, ChartTip, grid } from '../components/Charts'
import { Card, CountUp, LoadError, Loading, PageHeader, PillSelect, Reveal, SourceBadge, Stat, SubNav } from '../components/ui'
import { marketPages } from '../data/nav'
import { useDaily, useMonthly } from '../hooks/usePrices'
import { monthName, rupees } from '../lib/format'

// Single-hue sequential ramp (tomato), light to dark.
const RAMP = ['#FBE7D8', '#F8CDB3', '#F2A98A', '#E9805F', '#DB5A3C', '#BC3D22', '#8E2913']

function shade(value: number, low: number, high: number) {
  const t = (Math.log(value) - Math.log(low)) / (Math.log(high) - Math.log(low) || 1)
  return Math.min(RAMP.length - 1, Math.max(0, Math.floor(t * RAMP.length)))
}

const label = (month: string, lang: string) => {
  const [y, m] = month.split('-').map(Number)
  return `${monthName(m - 1, lang)} ${y}`
}

export default function History() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const reduced = useReducedMotion()
  const { data, failed } = useMonthly()
  const { data: daily } = useDaily()
  const [params] = useSearchParams()
  const [market, setMarket] = useState(params.get('market') ?? 'madanapalle')
  const [hover, setHover] = useState<string | null>(null)

  const series = useMemo(() => data?.series[market] ?? [], [data, market])
  const years = useMemo(() => [...new Set(series.map((s) => Number(s.month.slice(0, 4))))], [series])
  const [from, setFrom] = useState<number | null>(null)
  const [to, setTo] = useState<number | null>(null)
  const startYear = from ?? years[0]
  const endYear = to ?? years.at(-1)!

  const shown = useMemo(
    () => series.filter((s) => { const y = Number(s.month.slice(0, 4)); return y >= startYear && y <= endYear }),
    [series, startYear, endYear],
  )

  const stats = useMemo(() => {
    if (!shown.length) return null
    const high = shown.reduce((a, b) => (b.price > a.price ? b : a))
    const low = shown.reduce((a, b) => (b.price < a.price ? b : a))
    const average = shown.reduce((sum, s) => sum + s.price, 0) / shown.length
    const byMonth = Array.from({ length: 12 }, (_, m) => shown.filter((s) => Number(s.month.slice(5)) === m + 1).map((s) => s.price))
    const spread = byMonth.map((list) => {
      if (list.length < 2) return 0
      const mean = list.reduce((a, b) => a + b, 0) / list.length
      return Math.sqrt(list.reduce((a, b) => a + (b - mean) ** 2, 0) / list.length)
    })
    return { high, low, average, volatile: spread.indexOf(Math.max(...spread)) }
  }, [shown])

  if (failed) return <LoadError />
  if (!data || !stats) return <Loading />

  const lookup = new Map(series.map((s) => [s.month, s.price]))
  const events = t('history.events', { returnObjects: true }) as { when: string; kind: 'high' | 'low'; title: string; text: string }[]
  const hovered = hover ? lookup.get(hover) : undefined

  return (
    <>
      <PageHeader title={t('history.title')} intro={t('history.intro')}>
        <SourceBadge meta={data.meta} />
      </PageHeader>
      <SubNav pages={marketPages} />

      <div className="mb-5 flex flex-wrap gap-2">
        <PillSelect label={t('prices.market')} value={market} onChange={(e) => setMarket(e.target.value)}>
          {daily?.markets.map((m) => (
            <option key={m.id} value={m.id}>
              {t(`markets.${m.id}`)}
            </option>
          )) ?? <option value={market}>{t(`markets.${market}`)}</option>}
        </PillSelect>
        <PillSelect label={t('history.from')} value={startYear} onChange={(e) => setFrom(Number(e.target.value))}>
          {years.filter((y) => y <= endYear).map((y) => (
            <option key={y}>{y}</option>
          ))}
        </PillSelect>
        <PillSelect label={t('history.to')} value={endYear} onChange={(e) => setTo(Number(e.target.value))}>
          {years.filter((y) => y >= startYear).map((y) => (
            <option key={y}>{y}</option>
          ))}
        </PillSelect>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t('history.highest')} hint={label(stats.high.month, lang)}>
          <CountUp value={stats.high.price} digits={1} prefix="₹" />
        </Stat>
        <Stat label={t('history.lowest')} hint={label(stats.low.month, lang)}>
          <CountUp value={stats.low.price} digits={1} prefix="₹" />
        </Stat>
        <Stat label={t('history.average')}>
          <CountUp value={stats.average} digits={1} prefix="₹" />
        </Stat>
        <Stat label={t('history.volatile')}>{monthName(stats.volatile, lang, 'long')}</Stat>
      </div>

      <Reveal>
        <Card className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-bold">{t('history.monthly', { market: t(`markets.${market}`) })}</h2>
            <SourceBadge meta={data.meta} />
          </div>
          <div className="h-72 sm:h-80" role="img" aria-label={t('history.monthly', { market: t(`markets.${market}`) })}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shown} margin={{ top: 12, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="history-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#A8C23A" stopOpacity={0.45} />
                    <stop offset="1" stopColor="#A8C23A" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...grid} />
                <XAxis dataKey="month" {...axis} ticks={shown.filter((s) => s.month.endsWith('-01')).map((s) => s.month)} tickFormatter={(m: string) => m.slice(0, 4)} />
                <YAxis {...axis} tickFormatter={(v: number) => `₹${v}`} />
                <Tooltip content={<ChartTip title={(m) => label(m, lang)} />} cursor={{ stroke: '#8A8670' }} />
                <Area dataKey="price" type="monotone" stroke="#6F8A14" strokeWidth={2} fill="url(#history-fill)" isAnimationActive={!reduced} />
                <ReferenceDot x={stats.high.month} y={stats.high.price} r={5} fill="#E5482B" stroke="#FAF3E3" strokeWidth={2} />
                <ReferenceDot x={stats.low.month} y={stats.low.price} r={5} fill="#1F3A1F" stroke="#FAF3E3" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex gap-4 text-xs font-semibold text-muted">
            <li className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-tomato" />{t('history.recordHigh')}</li>
            <li className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-ink" />{t('history.recordLow')}</li>
          </ul>
        </Card>
      </Reveal>

      <Reveal>
        <Card className="mb-5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="font-bold">{t('history.heatmap')}</h2>
            <SourceBadge meta={data.meta} />
          </div>
          <p className="mb-3 min-h-5 text-sm text-muted" aria-live="polite">
            {hover && hovered !== undefined ? `${label(hover, lang)}: ${rupees(hovered, 1)}/kg` : t('history.heatHint')}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] border-separate border-spacing-0.5 text-center text-[10px] sm:text-xs">
              <thead>
                <tr>
                  <th className="w-9 sm:w-12" />
                  {Array.from({ length: 12 }, (_, m) => (
                    <th key={m} className="pb-1 font-semibold text-muted">
                      {monthName(m, lang).slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {years.map((year) => (
                  <tr key={year}>
                    <th className="pr-1 text-right font-semibold text-muted tabular">{year}</th>
                    {Array.from({ length: 12 }, (_, m) => {
                      const key = `${year}-${String(m + 1).padStart(2, '0')}`
                      const value = lookup.get(key)
                      if (value === undefined) return <td key={key} className="rounded bg-line/40" />
                      const step = shade(value, stats.low.price, stats.high.price)
                      return (
                        <td
                          key={key}
                          tabIndex={0}
                          onPointerEnter={() => setHover(key)}
                          onFocus={() => setHover(key)}
                          onClick={() => setHover(key)}
                          className={`h-7 cursor-default rounded font-semibold tabular sm:h-8 ${step >= 4 ? 'text-white' : 'text-ink'}`}
                          style={{ background: RAMP[step] }}
                        >
                          {Math.round(value)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted">
            {t('history.low')}
            <span className="flex h-2 w-32 overflow-hidden rounded-full">
              {RAMP.map((c) => <i key={c} className="flex-1" style={{ background: c }} />)}
            </span>
            {t('history.high')}
          </div>
        </Card>
      </Reveal>

      <h2 className="display mb-1 text-2xl">{t('history.eventsTitle')}</h2>
      <p className="mb-3 text-sm text-muted">{t('history.eventsNote')}</p>
      <div className="grid gap-3 md:grid-cols-3">
        {events.map((e) => (
          <Reveal key={e.title}>
            <Card className="h-full !p-5">
              <p className={`text-xs font-bold ${e.kind === 'high' ? 'text-cta' : 'text-lime-deep'}`}>{e.when}</p>
              <h3 className="mt-1 font-bold">{e.title}</h3>
              <p className="mt-1 text-sm text-muted">{e.text}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </>
  )
}
