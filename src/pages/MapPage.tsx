import { lazy, Suspense, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, LoadError, Loading, PageHeader, PillSelect, SourceBadge, SubNav } from '../components/ui'
import { marketPages } from '../data/nav'
import { useDaily } from '../hooks/usePrices'

const MandiMap = lazy(() => import('../components/MandiMap'))

export default function MapPage() {
  const { t } = useTranslation()
  const { data, failed } = useDaily()
  const [region, setRegion] = useState<'south' | 'india'>('south')
  if (failed) return <LoadError />
  if (!data) return <Loading />
  return (
    <>
      <PageHeader title={t('map.title')} intro={t('map.intro')}>
        <SourceBadge meta={data.meta} />
      </PageHeader>
      <SubNav pages={marketPages} />
      <div className="mb-3">
        <PillSelect label={t('map.region')} value={region} onChange={(e) => setRegion(e.target.value as 'south' | 'india')}>
          <option value="south">{t('map.south')}</option>
          <option value="india">{t('map.india')}</option>
        </PillSelect>
      </div>
      <Card className="!p-2">
        <div className="h-[65vh] min-h-96">
          <Suspense fallback={<Loading />}>
            <MandiMap markets={data.markets} region={region} />
          </Suspense>
        </div>
      </Card>
    </>
  )
}
