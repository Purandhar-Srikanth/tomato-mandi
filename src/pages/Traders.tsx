import { Search, Store, Truck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, LoadError, Loading, PageHeader, PillSelect, Reveal, SourceBadge, SubNav } from '../components/ui'
import { marketPages } from '../data/nav'
import { useTraders } from '../hooks/usePrices'
import { rupees } from '../lib/format'

export default function Traders() {
  const { t } = useTranslation()
  const { data, failed } = useTraders()
  const [query, setQuery] = useState('')
  const [market, setMarket] = useState('all')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (data?.traders ?? []).filter(
      (x) => (market === 'all' || x.market === market) && (!q || x.name.toLowerCase().includes(q) || x.yard.toLowerCase().includes(q)),
    )
  }, [data, query, market])

  if (failed) return <LoadError />
  if (!data) return <Loading />
  const markets = [...new Set(data.traders.map((x) => x.market))]

  return (
    <>
      <PageHeader title={t('traders.title')} intro={t('traders.intro')}>
        <SourceBadge meta={data.meta} />
      </PageHeader>
      <SubNav pages={marketPages} />

      <p className="mb-4 rounded-2xl bg-sun/35 px-4 py-3 text-sm font-semibold">{t('traders.placeholder')}</p>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-3 flex flex-wrap gap-2">
            <label className="relative min-w-48 flex-1">
              <span className="sr-only">{t('traders.search')}</span>
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('traders.search')}
                className="min-h-11 w-full rounded-full border border-line bg-white/70 pl-9 pr-3 text-sm placeholder:text-muted"
              />
            </label>
            <PillSelect label={t('prices.market')} value={market} onChange={(e) => setMarket(e.target.value)}>
              <option value="all">{t('traders.allMarkets')}</option>
              {markets.map((id) => (
                <option key={id} value={id}>{t(`markets.${id}`)}</option>
              ))}
            </PillSelect>
          </div>
          {list.length === 0 && <p className="py-6 text-center text-sm text-muted">{t('nav.noResults')}</p>}
          <ul className="divide-y divide-line">
            {list.map((x) => (
              <li key={x.id} className="flex items-center gap-3 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sun/40">
                  <Store size={17} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{x.name}</p>
                  <p className="text-sm text-muted">{t(`markets.${x.market}`)} · {x.yard}</p>
                </div>
                <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold">{t(`traders.${x.type}`)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Reveal>
          <Card>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-bold"><Truck size={17} aria-hidden />{t('traders.transport')}</h2>
              <SourceBadge meta={data.meta} />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="pb-2 font-semibold">{t('traders.city')}</th>
                  <th className="pb-2 text-right font-semibold">km</th>
                  <th className="pb-2 text-right font-semibold">₹/kg</th>
                </tr>
              </thead>
              <tbody>
                {data.routes.map((r) => (
                  <tr key={r.city} className="border-b border-line/60 last:border-0">
                    <td className="py-2 font-semibold">{t(`cities.${r.city}`)}</td>
                    <td className="text-right tabular">{r.km.toLocaleString('en-IN')}</td>
                    <td className="text-right font-bold tabular">{rupees(r.ratePerKg, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted">{t('traders.transportNote')}</p>
          </Card>
        </Reveal>
      </div>
    </>
  )
}
