import { Bug } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, PageHeader, Reveal, SubNav } from '../components/ui'
import { pests } from '../data/crop'
import { growPages } from '../data/nav'

const FIELDS = ['symptoms', 'identify', 'prevention', 'treatment'] as const

export default function Pests() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('pests.title')} intro={t('pests.intro')} />
      <SubNav pages={growPages} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pests.map((id, i) => (
          <Reveal key={id} delay={(i % 3) * 0.06}>
            <Card className="h-full">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-full bg-sun">
                  <Bug size={16} aria-hidden />
                </span>
                <h2 className="display text-2xl">{t(`pests.items.${id}.name`)}</h2>
              </div>
              <dl className="space-y-2 text-sm">
                {FIELDS.map((field) => (
                  <div key={field}>
                    <dt className="font-bold">{t(`pests.${field}`)}</dt>
                    <dd className="text-muted">{t(`pests.items.${id}.${field}`)}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 rounded-2xl bg-sun/35 px-4 py-3 text-sm font-semibold">{t('pests.safety')}</p>
    </>
  )
}
