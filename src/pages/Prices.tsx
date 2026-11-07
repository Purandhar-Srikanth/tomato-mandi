import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PriceTable } from '../components/PriceTable'
import { Card, CountUp, LoadError, Loading, PageHeader, PillSelect, Reveal, SourceBadge, Stat, SubNav } from '../components/ui'
import { marketPages } from '../data/nav'
import { useDaily } from '../hooks/usePrices'

type Sort = 'modal' | 'arrivals' | 'changePct'

export default function Prices() {
  const { t } = useTranslation()
  const { data, failed } = useDaily()
  const [sort, setSort] = useState<Sort>('modal')

  const markets = useMemo(() => [...(data?.markets ?? [])].sort((a, b) => (b[sort] ?? -Infinity) - (a[sort] ?? -Infinity)), [data, sort])
  if (failed) return <LoadError />
  if (!data) return <Loading />

  const home = data.markets.find((m) => m.id === 'madanapalle')!
  const top = [...data.markets].sort((a, b) => b.modal - a.modal)[0]
  const totalArrivals = data.markets.reduce((sum, m) => sum + m.arrivals, 0)

  return (
    <>
      <PageHeader title={t('prices.title')} intro={t('prices.intro')}>
        <SourceBadge meta={data.meta} />
      </PageHeader>
      <SubNav pages={marketPages} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={t('prices.madanapalleToday')}>
          <CountUp value={home.modal} digits={1} prefix="₹" />
        </Stat>
        <Stat label={t('prices.highest')} hint={t(`markets.${top.id}`)}>
          <CountUp value={top.modal} digits={1} prefix="₹" />
        </Stat>
        <Stat label={t('prices.totalArrivals')}>
          <CountUp value={totalArrivals} suffix=" t" />
        </Stat>
        <Stat label={t('prices.weekChange')} hint={t('markets.madanapalle')}>
          {home.weekChangePct === null ? '–' : <CountUp value={home.weekChangePct} digits={1} suffix="%" />}
        </Stat>
      </div>
      <Reveal>
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-bold">{t('prices.allMarkets')}</h2>
            <PillSelect label={t('prices.sortBy')} value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="modal">{t('prices.sortPrice')}</option>
              <option value="arrivals">{t('prices.sortArrivals')}</option>
              <option value="changePct">{t('prices.sortChange')}</option>
            </PillSelect>
          </div>
          <PriceTable markets={markets} detailed />
          <p className="mt-3 text-xs text-muted">{t('prices.unit')}</p>
        </Card>
      </Reveal>
    </>
  )
}
