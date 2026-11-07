import { useReducedMotion } from 'framer-motion'
import { Check, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axis, ChartTip, grid, SERIES_COLORS } from '../components/Charts'
import { Card, LoadError, Loading, NumberField, PageHeader, PillSelect, Progress, Reveal, SourceBadge, SubNav } from '../components/ui'
import { marketPages } from '../data/nav'
import { villages } from '../data/places'
import { useDaily } from '../hooks/usePrices'
import { fmtDate, rupees, signedPct } from '../lib/format'
import { netPrices } from '../lib/market'

/** Each pick keeps its colour slot, so removing one market never repaints the others. */
type Picks = (string | null)[]

export default function Compare() {
  const { t, i18n } = useTranslation()
  const { data, failed } = useDaily()
  const reduced = useReducedMotion()
  const [slots, setSlots] = useState<Picks>(['madanapalle', 'kolar', 'bengaluru', null])
  const [village, setVillage] = useState('madanapalle')
  const [rate, setRate] = useState(0.8)
  const [commission, setCommission] = useState(4)

  const picked = slots.flatMap((id, slot) => (id ? [{ id, slot }] : []))

  const toggle = (id: string) => {
    const at = slots.indexOf(id)
    if (at >= 0) {
      if (picked.length > 2) setSlots(slots.map((s, i) => (i === at ? null : s)))
      return
    }
    const free = slots.indexOf(null)
    if (free >= 0) setSlots(slots.map((s, i) => (i === free ? id : s)))
  }

  const chart = useMemo(() => {
    if (!data) return []
    const first = data.markets[0].history.slice(-30)
    return first.map((point, i) => {
      const row: Record<string, string | number> = { date: point.date }
      for (const m of data.markets) row[m.id] = m.history.slice(-30)[i]?.modal
      return row
    })
  }, [data])

  const ranked = useMemo(() => {
    const start = villages.find((v) => v.id === village) ?? villages[0]
    return data ? netPrices(data.markets, start, rate, commission) : []
  }, [data, village, rate, commission])

  if (failed) return <LoadError />
  if (!data) return <Loading />
  const topNet = Math.max(...ranked.map((r) => r.net), 1)

  return (
    <>
      <PageHeader title={t('compare.title')} intro={t('compare.intro')}>
        <SourceBadge meta={data.meta} />
      </PageHeader>
      <SubNav pages={marketPages} />

      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={t('compare.pick')}>
        {data.markets.map((m) => {
          const slot = slots.indexOf(m.id)
          const on = slot >= 0
          return (
            <button
              key={m.id}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(m.id)}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold ${on ? 'border-ink bg-white' : 'border-line bg-card'}`}
            >
              {on ? <Check size={14} style={{ color: SERIES_COLORS[slot] }} aria-hidden /> : null}
              {t(`markets.${m.id}`)}
            </button>
          )
        })}
      </div>
      <p className="mb-4 text-xs text-muted">{t('compare.pickHint')}</p>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {picked.map(({ id, slot }) => {
          const m = data.markets.find((x) => x.id === id)!
          return (
            <Card key={id} className="!p-4">
              <p className="flex items-center gap-2 text-sm font-bold">
                <i className="size-2.5 rounded-full" style={{ background: SERIES_COLORS[slot] }} />
                {t(`markets.${id}`)}
              </p>
              <p className="display num mt-1 text-3xl">{rupees(m.modal, 1)}</p>
              <dl className="mt-2 space-y-0.5 text-xs text-muted tabular">
                <div className="flex justify-between">
                  <dt>{t('compare.range')}</dt>
                  <dd>
                    {rupees(m.min, 1)}–{rupees(m.max, 1)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t('prices.arrivals')}</dt>
                  <dd>{m.arrivals} t</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t('compare.week')}</dt>
                  <dd>{signedPct(m.weekChangePct)}</dd>
                </div>
              </dl>
            </Card>
          )
        })}
      </div>

      <Reveal>
        <Card className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-bold">{t('compare.last30')}</h2>
            <SourceBadge meta={data.meta} />
          </div>
          <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
            {picked.map(({ id, slot }) => (
              <li key={id} className="flex items-center gap-1.5">
                <i className="h-0.5 w-4 rounded" style={{ background: SERIES_COLORS[slot] }} />
                {t(`markets.${id}`)}
              </li>
            ))}
          </ul>
          <div className="h-72" role="img" aria-label={t('compare.last30')}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chart} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid {...grid} />
                <XAxis
                  dataKey="date"
                  {...axis}
                  minTickGap={40}
                  tickFormatter={(d: string) => fmtDate(d, i18n.language, { day: 'numeric', month: 'short' })}
                />
                <YAxis {...axis} domain={['auto', 'auto']} tickFormatter={(v: number) => `₹${v}`} />
                <Tooltip
                  content={<ChartTip title={(d) => fmtDate(d, i18n.language, { day: 'numeric', month: 'long' })} />}
                  cursor={{ stroke: '#8A8670' }}
                />
                {picked.map(({ id, slot }) => (
                  <Line key={id} dataKey={id} name={t(`markets.${id}`)} stroke={SERIES_COLORS[slot]} strokeWidth={2} dot={false} type="monotone" isAnimationActive={!reduced} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Reveal>

      <Reveal>
        <Card>
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="display text-2xl">{t('compare.bestTitle')}</h2>
            <SourceBadge meta={data.meta} />
          </div>
          <p className="mb-4 text-sm text-muted">{t('compare.bestIntro')}</p>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="text-sm font-medium text-muted">
              {t('compare.startFrom')}
              <PillSelect className="mt-1 w-full" label={t('compare.startFrom')} value={village} onChange={(e) => setVillage(e.target.value)}>
                {villages.map((v) => (
                  <option key={v.id} value={v.id}>
                    {t(`villages.${v.id}`)}
                  </option>
                ))}
              </PillSelect>
            </div>
            <NumberField label={t('compare.rate')} value={rate} onChange={setRate} step={0.1} suffix="₹/kg" />
            <NumberField label={t('compare.commission')} value={commission} onChange={setCommission} step={0.5} suffix="%" />
          </div>
          <ol className="space-y-3">
            {ranked.map((r, i) => (
              <li key={r.market.id}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex items-center gap-1.5 font-bold">
                    {i === 0 && <Trophy size={14} className="text-lime-deep" aria-label={t('compare.best')} />}
                    {t(`markets.${r.market.id}`)}
                    <span className="font-normal text-muted">· {Math.round(r.km)} km</span>
                  </span>
                  <span className="shrink-0 font-bold tabular">{rupees(r.net, 1)}/kg</span>
                </div>
                <Progress value={(Math.max(r.net, 0) / topNet) * 100} tone={r.net > 0 ? 'lime' : 'tomato'} label={t(`markets.${r.market.id}`)} />
                <p className="mt-1 text-xs text-muted tabular">
                  {t('compare.breakdown', { modal: rupees(r.market.modal, 1), transport: rupees(r.transport, 1), commission: rupees(r.commission, 1) })}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted">{t('compare.note')}</p>
        </Card>
      </Reveal>
    </>
  )
}
