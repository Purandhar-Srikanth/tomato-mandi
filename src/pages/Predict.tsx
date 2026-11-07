import { useReducedMotion } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axis, grid } from '../components/Charts'
import { Card, LoadError, Loading, PageHeader, Reveal, SourceBadge, SubNav } from '../components/ui'
import { marketPages } from '../data/nav'
import { useForecast } from '../hooks/usePrices'
import { fmtDate, rupees } from '../lib/format'

interface Row {
  date: string
  actual?: number
  estimate?: number
  band?: [number, number]
}

export default function Predict() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const reduced = useReducedMotion()
  const { data, failed } = useForecast()

  const rows = useMemo<Row[]>(() => {
    if (!data) return []
    const history: Row[] = data.history.map((h) => ({ date: h.date, actual: h.price }))
    const last = data.history.at(-1)!
    // The last actual point anchors the estimate so the lines join up.
    history[history.length - 1] = { date: last.date, actual: last.price, estimate: last.price, band: [last.price, last.price] }
    return [...history, ...data.forecast.map((f) => ({ date: f.date, estimate: f.price, band: [f.lo, f.hi] as [number, number] }))]
  }, [data])

  if (failed) return <LoadError />
  if (!data) return <Loading />
  const day = (d: string) => fmtDate(d, lang, { day: 'numeric', month: 'short' })

  return (
    <>
      <PageHeader title={t('predict.title')} intro={t('predict.intro')}>
        <SourceBadge meta={data.meta} />
      </PageHeader>
      <SubNav pages={marketPages} />

      <p className="mb-5 flex items-center gap-2 rounded-2xl bg-sun/35 px-4 py-3 text-sm font-bold">
        <TriangleAlert size={17} className="shrink-0" aria-hidden />
        {t('predict.disclaimer')}
      </p>

      <Reveal>
        <Card className="mb-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-bold">{t('predict.chartTitle')}</h2>
            <SourceBadge meta={data.meta} />
          </div>
          <div className="h-80" role="img" aria-label={t('predict.chartTitle')}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} margin={{ top: 12, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid {...grid} />
                <XAxis dataKey="date" {...axis} minTickGap={32} tickFormatter={day} />
                <YAxis {...axis} domain={['auto', 'auto']} tickFormatter={(v: number) => `₹${Math.round(v)}`} />
                <Tooltip
                  cursor={{ stroke: '#8A8670' }}
                  content={({ active, label }) => {
                    const row = rows.find((r) => r.date === label)
                    if (!active || !row) return null
                    return (
                      <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg">
                        <p className="font-bold">{day(String(label))}</p>
                        {row.actual !== undefined && <p>{t('predict.actual')}: <b>{rupees(row.actual, 1)}</b></p>}
                        {row.actual === undefined && row.estimate !== undefined && <p>{t('predict.estimate')}: <b>{rupees(row.estimate, 1)}</b></p>}
                        {row.actual === undefined && row.band && <p className="text-muted">{rupees(row.band[0], 1)} – {rupees(row.band[1], 1)}</p>}
                      </div>
                    )
                  }}
                />
                <Area dataKey="band" stroke="none" fill="#A8C23A" fillOpacity={0.3} isAnimationActive={!reduced} />
                <ReferenceLine x={data.history.at(-1)!.date} stroke="#E5482B" strokeWidth={1.5} />
                <Line dataKey="actual" stroke="#1F3A1F" strokeWidth={2} dot={false} type="monotone" isAnimationActive={!reduced} />
                <Line dataKey="estimate" stroke="#6F8A14" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: '#6F8A14' }} type="monotone" isAnimationActive={!reduced} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-4 text-xs font-semibold text-muted">
            <li className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-ink" />{t('predict.actual')}</li>
            <li className="flex items-center gap-1.5"><i className="h-0.5 w-4 bg-lime-deep" />{t('predict.estimate')}</li>
            <li className="flex items-center gap-1.5"><i className="h-2.5 w-4 rounded-sm bg-lime/35" />{t('predict.band')}</li>
          </ul>
        </Card>
      </Reveal>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {data.forecast.map((f, i) => (
          <Card key={f.date} className="!p-4">
            <p className="text-sm font-medium text-muted">{t('predict.week', { n: i + 1 })} · {day(f.date)}</p>
            <p className="display num text-3xl">{rupees(f.price, 1)}</p>
            <p className="text-xs text-muted tabular">{rupees(f.lo, 1)} – {rupees(f.hi, 1)}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-1 font-bold">{t('predict.howTitle')}</h2>
        <p className="text-sm text-muted">{t('predict.how')}</p>
      </Card>
    </>
  )
}
