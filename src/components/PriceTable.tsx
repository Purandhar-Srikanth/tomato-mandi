import { LineChart, TrendingDown, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { rupees, signedPct } from '../lib/format'
import type { Market } from '../lib/types'
import { Progress } from './ui'

function Change({ value }: { value: number }) {
  const Icon = value >= 0 ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 font-bold tabular ${value >= 0 ? 'text-lime-deep' : 'text-cta'}`}>
      <Icon size={14} aria-hidden />
      {signedPct(value)}
    </span>
  )
}

function arrivalShare(market: Market) {
  return Math.min(100, (market.arrivals / market.arrivalsCapacity) * 100)
}

/** Table on larger screens, stacked rows on phones. `detailed` adds min and max. */
export function PriceTable({ markets, detailed = false }: { markets: Market[]; detailed?: boolean }) {
  const { t } = useTranslation()
  const head = 'pb-2 pr-3 text-left text-xs font-semibold text-muted'
  return (
    <>
      <table className="hidden w-full text-sm sm:table">
        <thead>
          <tr className="border-b border-line">
            <th className={head}>{t('prices.market')}</th>
            <th className={head}>{t('prices.grade')}</th>
            {detailed && <th className={head}>{t('prices.min')}</th>}
            {detailed && <th className={head}>{t('prices.max')}</th>}
            <th className={head}>{detailed ? t('prices.modal') : t('prices.price')}</th>
            <th className={head}>{t('prices.arrivals')}</th>
            <th className={head}>{t('prices.change')}</th>
            <th className={`${head} pr-0`}>
              <span className="sr-only">{t('prices.trend')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m) => (
            <tr key={m.id} className="border-b border-line/60 last:border-0">
              <td className="py-2.5 pr-3 font-semibold">{t(`markets.${m.id}`)}</td>
              <td className="pr-3">{m.grade}</td>
              {detailed && <td className="pr-3 tabular">{rupees(m.min, 1)}</td>}
              {detailed && <td className="pr-3 tabular">{rupees(m.max, 1)}</td>}
              <td className="pr-3 font-bold tabular">{rupees(m.modal, 1)}</td>
              <td className="min-w-24 pr-3">
                <span className="mb-1 block text-xs tabular">{m.arrivals.toLocaleString('en-IN')} t</span>
                <Progress
                  value={arrivalShare(m)}
                  tone={m.arrivalsChangePct < -25 ? 'tomato' : 'lime'}
                  label={t('prices.arrivals')}
                />
              </td>
              <td className="pr-3">
                <Change value={m.changePct} />
              </td>
              <td className="text-right">
                <Link
                  to={`/history?market=${m.id}`}
                  className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line bg-white/70 px-3 text-xs font-bold hover:bg-white"
                >
                  <LineChart size={13} aria-hidden />
                  {t('prices.trend')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="divide-y divide-line sm:hidden">
        {markets.map((m) => (
          <li key={m.id} className="py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-bold">
                {t(`markets.${m.id}`)} <span className="text-xs font-medium text-muted">{t('prices.gradeShort', { grade: m.grade })}</span>
              </p>
              <p className="display num text-2xl">{rupees(m.modal, 1)}</p>
            </div>
            {detailed && (
              <p className="text-xs text-muted tabular">
                {t('prices.min')} {rupees(m.min, 1)} · {t('prices.max')} {rupees(m.max, 1)}
              </p>
            )}
            <div className="mt-1.5 flex items-center gap-3 text-sm">
              <span className="shrink-0 text-xs tabular">{m.arrivals.toLocaleString('en-IN')} t</span>
              <Progress value={arrivalShare(m)} tone={m.arrivalsChangePct < -25 ? 'tomato' : 'lime'} label={t('prices.arrivals')} />
              <Change value={m.changePct} />
              <Link to={`/history?market=${m.id}`} aria-label={`${t('prices.trend')}: ${t(`markets.${m.id}`)}`} className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white/70">
                <LineChart size={15} aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
